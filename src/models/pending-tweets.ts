// PendingTweets model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";
import { SendTweetV2Params } from "twitter-api-v2";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "pending-tweets";
const PRIMARY_KEY = "id";

export class PendingTweets extends DataModel {

    public static async findByUser(clerkId: string): Promise<PendingTweets[]> {
        return PendingTweets.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static async findPending(): Promise<PendingTweets[]> {
        return PendingTweets.finder.find(DataFilter.lessThan("postingDate", Date.now()));
    }

    public static finder = new DataFinder<PendingTweets, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<PendingTweets>) => { return new PendingTweets(data) });

    public id: string;
    public twitterId: string;
    public clerkId: string;
    public postingDate: number;
    public content: SendTweetV2Params[];


    constructor(data: TypedRow<PendingTweets>) {
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