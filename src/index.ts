import dotenv from "dotenv";
dotenv.config();
import {
    Client,
    GatewayIntentBits,
    Events,
    REST as DiscordRestClient,
    Routes,
    ChatInputCommandInteraction,
} from "discord.js";
import { InteractionHandler } from "./handler/CommandHandler";
import { userPlayedSong } from "./firebase/firebaseConfig";
const DISCORD_ACCESS_TOKEN = process.env.DISCORD_ACCESS_TOKEN || "";
const APP_ID = process.env.APP_ID || "";

class CinammonBot {
    private client: Client;
    private discordRestClient: DiscordRestClient;
    private interactionHandler: InteractionHandler;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
        this.discordRestClient = new DiscordRestClient().setToken(DISCORD_ACCESS_TOKEN);
        this.interactionHandler = new InteractionHandler();
    }

    async startBot() {
        try {
            await this.client.login(DISCORD_ACCESS_TOKEN);
            console.log("Bot started");
            this.listenToPancakeMessages();
            await this.registerSlashCommands();
            this.addClientEventHandlers();
        } catch (err) {
            console.error("Error starting bot", err);
        }
    }

    listenToPancakeMessages(){
        this.client.on(Events.MessageCreate, async (message) => {
            try {
                if (
                    message.author.bot &&
                    message.author.displayName === "Pancake"
                ) {
                    const { author, content, embeds  } = message;
                    message.channel.send({ embeds: embeds, content: content });
                    console.log("author:", author);
                    const embed = embeds[0];
                    if (!embed) return
                    const { title, description }  = embed;
                    if (title === 'Now Playing') {
                        if(!description) return;
                        const lines = description.split('\n');
                        const [ song, artist ] = lines[0].split(' - ');
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const [ _, user ] = lines[lines.length - 1].split('Requested by: <@');
                        const cleanedUser = user.slice(0, -1);    
                        const userRecord = {
                            userId: cleanedUser,
                            song,
                            artist
                        };
                        console.log(userRecord);
                        userPlayedSong(cleanedUser, song, artist);
                    }
                }
            } catch (error) {
                console.error("Error handling message", error);
            }
        });
    }

    async registerSlashCommands() {
        const commands = this.interactionHandler.getSlashCommands();
        try {
            const data = await this.discordRestClient.put(
                Routes.applicationCommands(APP_ID),
                {
                    body: commands,
                }
            ) as Record<string, unknown>[];
            console.log(data);
            for (const command of data) {
                if(command.options){
                    console.log(command.options)
                }
            }
            console.log(
                `Successfully registered ${data.length} global application (/) commands`
            );
        } catch (error) {
            console.error("Error registering application (/) commands", error);
        }
    }

    addClientEventHandlers() {
        this.client.on(Events.InteractionCreate, (interaction) => {
            try {
                this.interactionHandler.handleInteraction(
                    interaction as ChatInputCommandInteraction 
                );
            } catch (error) {
                console.error("Error handling interaction", error);
            }
        });
    }
}

const bot = new CinammonBot();
bot.startBot();

