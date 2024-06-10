// TwitterMedia model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "media-twitter";
const PRIMARY_KEY = "id";

interface Followers {
    count: number;
    date: number;
}

export class TwitterMedia extends DataModel {

    public static async findByUser(clerkId: string): Promise<TwitterMedia[]> {
        return TwitterMedia.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static async findAll(): Promise<TwitterMedia[]> {
        return TwitterMedia.finder.find(DataFilter.any());
    }

    public static finder = new DataFinder<TwitterMedia, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<TwitterMedia>) => { return new TwitterMedia(data) });

    public id: string;
    public clerkId: string;
    public date: number;
    public tokenAccess: string;
    public tokenRefresh: string;
    public tokenExpiration: number;
    public profile = {
        id: '',
        username: '',
        url: '',
        picture: '',
        followers: [] as Followers[],
    };
    public posts: any[] = [];

    constructor(data: TypedRow<TwitterMedia>) {
        // First, we call DataModel constructor 
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = enforceType(data.id, "string") || '';
        this.clerkId = enforceType(data.clerkId, "string") || '';
        this.date = enforceType(data.date, "int") || 0;
        this.tokenAccess = enforceType(data.tokenAccess, "string") || '';
        this.tokenRefresh = enforceType(data.tokenRefresh, "string") || '';
        this.tokenExpiration = enforceType(data.tokenExpiration, "int") || 0;
        this.profile = enforceType(data.profile, "object") || {};
        this.posts = enforceType(data.posts, "array") || [];

        // Finally, we must call init()
        this.init();
    }
}