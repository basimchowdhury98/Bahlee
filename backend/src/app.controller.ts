import { Controller, Get, Post } from '@nestjs/common';
import { Bot } from 'grammy';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
    todo: string = 'Feed cat';

    constructor(private readonly configService: ConfigService) { }

    @Get()
    getHello(): string {
        return this.todo;
    }

    @Post('test-notif')
    testNotif(): void {
        const bot = new Bot(this.configService.get<string>('BOT_ID') as string);
        const basimChatId = this.configService.get<string>('BASIM_CHAT_ID') as string;
        const mahleeChatId = this.configService.get<string>('MAHLEE_CHAT_ID') as string;
        bot.api.sendMessage(basimChatId, "Peepee poopoo");
        bot.api.sendMessage(mahleeChatId, "Peepee poopoo Mahee");
    }
}
