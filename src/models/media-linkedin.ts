// LinkedinMedia model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "media-linkedin";
const PRIMARY_KEY = "id";

interface Followers {
    count: number;
    date: number;
}

export class LinkedinMedia extends DataModel {

    public static async findByUser(clerkId: string): Promise<LinkedinMedia[]> {
        return LinkedinMedia.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static async findAll(): Promise<LinkedinMedia[]> {
        return LinkedinMedia.finder.find(DataFilter.any());
    }

    public static finder = new DataFinder<LinkedinMedia, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<LinkedinMedia>) => { return new LinkedinMedia(data) });

    public id: string;
    public clerkId: string;
    public date: number;
    public tokenAccess: string;
    public tokenExpiration: number;
    public profile = {
        id: '',
        username: '',
        picture: '',
        followers: [] as Followers[],
    };
    public posts: any[] = [];

    constructor(data: TypedRow<LinkedinMedia>) {
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
        this.tokenExpiration = enforceType(data.tokenExpiration, "int") || 0;
        this.profile = enforceType(data.profile, "object") || {};
        this.posts = enforceType(data.posts, "array") || [];

        // Finally, we must call init()
        this.init();
    }
}