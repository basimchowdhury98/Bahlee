import { Controller, Get, Post } from '@nestjs/common';
import { TelegramBot } from './telegram.bot';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Controller()
export class AppController {
    todo: string = 'Feed cat';

    constructor(
        private readonly telegramBot: TelegramBot,
        private readonly schedulerRegistry: SchedulerRegistry)
        {
            const todoJob = new CronJob('0 9 * * *', () => {
                this.telegramBot.sendTodo()
            });

            this.schedulerRegistry.addCronJob('todo', todoJob);
            todoJob.start();
        }

    @Get()
    getHello(): string {
        return this.todo;
    }

    @Post('test-notif')
    testNotif(): void {
        this.telegramBot.sendTodo();
    }
}
