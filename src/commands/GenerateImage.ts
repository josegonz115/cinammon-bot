import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    CacheType,
    AttachmentBuilder,
} from "discord.js";
import { Command } from "../types/types";

export class GenerateImage implements Command {
    name = "stabilityai";
    description = "conjure up your wildest imaginations and let sd3 do the rest";
    optionName = "prompt";
    optionDescription = "The prompt you want to generate an image for";
    slashCommandConfig = new SlashCommandBuilder()
        .setName(this.name).setDescription(this.description)
        .addStringOption(option => 
            option.setName(this.optionName).setDescription(this.optionDescription).setRequired(true)
        )

    async execute(
        interaction: ChatInputCommandInteraction<CacheType>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        await interaction.deferReply();
        const prompt = interaction.options.getString("prompt");
        console.log(prompt);
        try {
            const responseContent = await fetch(
                `${process.env.IMAGE_GENERATION_URL}?prompt=${prompt}`
            )
            if (!responseContent.ok) {
                throw new Error(`HTTP error! status: ${responseContent.status}`);
            }
            const arrayBuffer = await responseContent.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const chartAttachment = new AttachmentBuilder(buffer, { name: 'generated_image.jpeg' });

            return interaction.editReply({
                embeds: [
                    {
                        image: {
                            url: 'attachment://generated_image.jpeg',
                        },
                        footer: { text: `Prompt by: ${interaction.user.username}` },
                    },
                ],
                files: [chartAttachment],
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply("Failed to generate image");
        }
        // return interaction.reply("This command is currently disabled");
    }
}
