import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export default class CreateTransactions1639999200891 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.createTable(
            new Table({
                name: 'transactions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                    },
                    {
                        name: 'value',
                        type: 'numeric',
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                    },
                    {
                        name: 'category_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ]
            })
        );

        queryRunner.createForeignKey('transactions',
            new TableForeignKey({
                name: 'TransactionsCategory',
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.dropForeignKey('transactions', 'TransactionsCategory' );
        queryRunner.dropTable('transactions');
    }

}
