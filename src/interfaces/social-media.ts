
/* YOUTUBE */

export enum YoutubeContentType {
    short = "short",
    video = "video",
}

export interface YoutubeContent {
    title?: string;
    description?: string;
    type: YoutubeContentType;
    media: File;
}

/* LINKEDIN */

export enum shareMediaCategory {
    NONE = "NONE",
    ARTICLE = "ARTICLE",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
}

export interface ShareMedia {
    status: string;
    description: string;
    media: string;
    originalUrl: string;
    title: string;
}

export interface LinkedinContent {
    shareCommentary: string;
    shareMediaCategory: shareMediaCategory;
    media?: File[];
}

/* TWITTER */

export declare type TTweetReplySettingsV2 = 'mentionedUsers' | 'following' | 'everyone';

export interface TwitterContent {           // Extends from TweetV2Params
    direct_message_deep_link?: string;
    for_super_followers_only?: 'True' | 'False';
    geo?: {
        place_id: string;
    };
    media?: {
        media_ids?: string[];
        tagged_user_ids?: string[];
    };
    poll?: {
        duration_minutes: number;
        options: string[];
    };
    quote_tweet_id?: string;
    reply?: {
        exclude_reply_user_ids?: string[];
        in_reply_to_tweet_id: string;
    };
    reply_settings?: TTweetReplySettingsV2 | string;
    text?: string;
}

export type SocialMediaContent = TwitterContent | TwitterContent[] | YoutubeContent | LinkedinContent;

export interface AllSocialMediaContent {
    twitter?: SocialMediaContent;
    youtube?: SocialMediaContent;
    linkedin?: SocialMediaContent;
}