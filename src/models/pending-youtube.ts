// PendingYoutube model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "pending-youtube";
const PRIMARY_KEY = "id";

enum YoutubeContentType {
    short = "short",
    video = "video",
}

interface YoutubeContent {
    title: string;
    description: string;
    type: YoutubeContentType;
    mediaPath: string;
}

export class PendingYoutube extends DataModel {

    public static async findByUser(clerkId: string): Promise<PendingYoutube[]> {
        return PendingYoutube.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static async findPending(): Promise<PendingYoutube[]> {
        return PendingYoutube.finder.find(DataFilter.lessThan("postingDate", Date.now()));
    }

    public static finder = new DataFinder<PendingYoutube, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<PendingYoutube>) => { return new PendingYoutube(data) });

    public id: string;
    public twitterId: string;
    public clerkId: string;
    public postingDate: number;
    public content: YoutubeContent;


    constructor(data: TypedRow<PendingYoutube>) {
        // First, we call DataModel constructor 
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = enforceType(data.id, "string") || '';
        this.clerkId = enforceType(data.clerkId, "string") || '';
        this.twitterId = enforceType(data.twitterId, "string") || '';
        this.postingDate = enforceType(data.postingDate, "int") || 0;
        this.content = enforceType(data.content, "object") || {};

        // Finally, we must call init()
        this.init();
    }
}