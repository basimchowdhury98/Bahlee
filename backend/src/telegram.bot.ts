import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Bot, InlineKeyboard } from "grammy";
import { ConfigService } from '@nestjs/config';


@Injectable()
export class TelegramBot implements OnModuleInit, OnModuleDestroy {
    private bot: Bot;
    private basimChatId: string;
    private mahleeChatId: string;
    private todoActions = new InlineKeyboard()
        .text('done', 'todo-done');
    private tetheredMsgIds = new Map<number, number>;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        this.basimChatId = this.configService.get<string>('BASIM_CHAT_ID') as string;
        this.mahleeChatId = this.configService.get<string>('MAHLEE_CHAT_ID') as string;
        this.bot = new Bot(this.configService.get<string>('BOT_ID') as string);

        this.bot.callbackQuery('todo-done', async (ctx) => {
            let basimMsgId = ctx.msgId;
            let mahleeMsgId = ctx.msgId;
            if (ctx.from.first_name == 'Mahlee')
            {
                basimMsgId = this.tetheredMsgIds.get(mahleeMsgId!);
            }
            else {
                mahleeMsgId = this.tetheredMsgIds.get(basimMsgId!);
            }

            this.bot.api.editMessageReplyMarkup(this.basimChatId, basimMsgId!, {
                reply_markup: undefined
            });
            this.bot.api.editMessageReplyMarkup(this.mahleeChatId, mahleeMsgId!, {
                reply_markup: undefined
            });
            this.bot.api.sendMessage(this.basimChatId, "Done by " + ctx.from.first_name);
            this.bot.api.sendMessage(this.mahleeChatId, "Done by " + ctx.from.first_name);
        });

        this.bot.start();
    }

    onModuleDestroy() {
        console.log('bot destroy');
    }

    async sendTodo() {
        const basimMsg = await this.bot.api.sendMessage(this.basimChatId, "Feed cat", {
            reply_markup: this.todoActions
        });
        const mahleeMsg = await this.bot.api.sendMessage(this.mahleeChatId, "Feed cat", {
            reply_markup: this.todoActions
        });
        this.tetheredMsgIds.set(basimMsg.message_id, mahleeMsg.message_id);
        this.tetheredMsgIds.set(mahleeMsg.message_id, basimMsg.message_id);
    }
}
