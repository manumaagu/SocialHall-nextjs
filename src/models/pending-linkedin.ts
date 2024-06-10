// PendingLinkedin model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "pending-linkedin";
const PRIMARY_KEY = "id";

enum shareMediaCategory {
    NONE = "NONE",
    ARTICLE = "ARTICLE",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
}

interface LinkedinContent {
    shareCommentary: string;
    shareMediaCategory: shareMediaCategory;
    media?: ShareMedia[];
}

interface ShareMedia {
    status: string;
    description: string;
    media: string;
    originalUrl: string;
    title: string;
}

export class PendingLinkedin extends DataModel {

    public static async findByUser(clerkId: string): Promise<PendingLinkedin[]> {
        return PendingLinkedin.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static async findPending(): Promise<PendingLinkedin[]> {
        return PendingLinkedin.finder.find(DataFilter.lessThan("postingDate", Date.now()));
    }

    public static finder = new DataFinder<PendingLinkedin, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<PendingLinkedin>) => { return new PendingLinkedin(data) });

    public id: string;
    public twitterId: string;
    public clerkId: string;
    public postingDate: number;
    public contentType: string;
    public content: LinkedinContent;


    constructor(data: TypedRow<PendingLinkedin>) {
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
        this.contentType = enforceType(data.contentType, "string") || '';
        this.content = enforceType(data.content, "object") || {};

        // Finally, we must call init()
        this.init();
    }
}