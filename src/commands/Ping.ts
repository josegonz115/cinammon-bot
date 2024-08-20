import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    CacheType,
} from "discord.js";
import { Command } from "../types/types";

export class PingCommand implements Command {
    name = "ping";
    description = "Pings the bot";
    slashCommandConfig = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);

    async execute(
        interaction: ChatInputCommandInteraction<CacheType>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        return interaction.reply("Pong!");
    }
}
