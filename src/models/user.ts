// User model

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "user";
const PRIMARY_KEY = "id";

export class User extends DataModel {

    public static async findByUser(clerkId: string): Promise<User[]> {
        return User.finder.find(DataFilter.equals("clerkId", clerkId));
    }

    public static finder = new DataFinder<User, string>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<User>) => { return new User(data) });

    public id: string;
    public clerkId: string;
    public date: number;

    constructor(data: TypedRow<User>) {
        // First, we call DataModel constructor 
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = enforceType(data.id, "string") || '';
        this.clerkId = enforceType(data.clerkId, "string") || '';
        this.date = enforceType(data.date, "int") || 0;

        // Finally, we must call init()
        this.init();
    }
}