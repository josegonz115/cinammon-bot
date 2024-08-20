// import { ChatInputCommandInteraction } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../types/types";
import { PingCommand } from "../commands/Ping";
import { MyMusicMoodCommand } from "../commands/MyMusicMood";
import { GenerateImage } from "../commands/GenerateImage";

export class InteractionHandler {
    private commands: Command[];

    constructor() {
        this.commands = [
            new PingCommand(),
            new MyMusicMoodCommand(),
            new GenerateImage(),
        ];
    }

    getSlashCommands() {
        return this.commands.map((command: Command) =>
            command.slashCommandConfig.toJSON()
        );
    }

    async handleInteraction(
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const commandName = interaction.commandName;
        const matchedCommand = this.commands.find(
            (command) => command.name === commandName
        );
        if (!matchedCommand) {
            return Promise.reject("Command not matched");
        }
        try {
            await matchedCommand.execute(interaction);
            console.log(
                `Sucesfully executed command [/${interaction.commandName}]`,
                {
                    guild: {
                        id: interaction.guildId,
                        name: interaction.guild?.name ?? "Direct Message",
                    },
                    user: { name: interaction.user.globalName },
                }
            );
        } catch (err) {
            console.log(
                `Error executing command [/${interaction.commandName}]: ${err}`,
                {
                    guild: {
                        id: interaction.guildId,
                        name: interaction.guild?.name ?? "Direct Message",
                    },
                    user: { name: interaction.user.globalName },
                }
            )
        }
    }
}
