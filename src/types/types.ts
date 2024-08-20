/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface Command {
    name: string;
    description?: string;
    slashCommandConfig: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder ;

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface CommandData {
    id: string;
    application_id: string;
    version: string;
    default_member_permissions: null | any;
    type: number;
    name: string;
    name_localizations: null | any;
    description: string;
    description_localizations: null | any;
    dm_permission: boolean;
    contexts: null | any;
    integration_types: number[];
    nsfw: boolean;
}

export interface UserMusicData {
    userId: string;
    username: string;
    musicArtist: string;
    musicTitle: string;
    // maybe add more
}