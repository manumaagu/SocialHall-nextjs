// Event model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "event";
const PRIMARY_KEY = "id";

export class Event extends DataModel {

    public static async findByUser(clerkId: string): Promise<Event[]> {
        return Event.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static async findByPendingId(pendingId: string): Promise<Event[]> { 
        return Event.finder.find(DataFilter.equals("pendingId", pendingId));
    }

    public static finder = new DataFinder<Event, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<Event>) => { return new Event(data) });

    public id: string;
    public clerkId: string;
    public socialMedia: string;
    public content: { text: string };  // Add here the type of the content available 
    public pendingId: string;
    public date: number;
    public posted: boolean;

    constructor(data: TypedRow<Event>) {
        // First, we call DataModel constructor 
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = enforceType(data.id, "string") || '';
        this.clerkId = enforceType(data.clerkId, "string") || '';
        this.socialMedia = enforceType(data.socialMedia, "string") || '';
        this.content = enforceType(data.content, "object") || '';
        this.date = enforceType(data.date, "int") || 0;
        this.pendingId = enforceType(data.pendingId, "string") || '';
        this.posted = enforceType(data.posted, "boolean") || false;

        // Finally, we must call init()
        this.init();
    }
}