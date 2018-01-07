import * as uuid from 'uuid';
import {Db} from 'mongodb';
import {EntitySerializer} from '../entities/serializer/EntitySerializer';
import {EntitySerializerFactory} from '../entities/serializer/EntitySerializerFactory';

export abstract class AbstractDao {

    protected db: Db;
    protected entitySerializer: EntitySerializer;

    constructor(db: Db) {
        this.db = db;
        this.entitySerializer = EntitySerializerFactory.newInstance();
    }

    protected generateIdIfNecessary(document: any) {
        if (!document._id) {
            document._id = uuid.v4();
        }
    }
}
