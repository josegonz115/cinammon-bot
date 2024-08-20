import { AttachmentBuilder, CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/types";
import { getTop10Songs } from "../firebase/firebaseConfig";

export class MyMusicMoodCommand implements Command {
    name = "mymusicmood";
    description = "Generates a mood chart based on your music taste";
    slashCommandConfig = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);

    async execute(
        interaction: ChatInputCommandInteraction<CacheType>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        await interaction.deferReply();
        // return interaction.reply("I'm sorry, I don't have a mood yet.");
        const top10Songs = await getTop10Songs(interaction.user.id);
        if (!top10Songs) {
            return interaction.editReply("You have not played any songs yet");
        }
        const chartResponse = await fetch(`${process.env.CHART_GENERATION_URL}?track_ids=${top10Songs.map(song => song.track_id).join(",")}`);
        if(!chartResponse.ok){
            return interaction.reply("Failed to generate mood chart");
        }
        const chartBuffer = await chartResponse.arrayBuffer();
        const chartAttachment = new AttachmentBuilder(Buffer.from(chartBuffer), { name: 'moodchart.png' });
        
        
        return interaction.editReply({
            content: "Here are your top 10 songs",
            embeds: [
                {
                    title: "Top 10 songs",
                    description: top10Songs
                        .map((song, index) => `${index + 1}. ${song.song} by ${song.artist}`)
                        .join("\n"),
                    image: {
                        url: 'attachment://moodchart.png',
                    },
                    
                },
            ],
            files: [chartAttachment],
        });
    }
}