import fs from 'fs';
import csvParser from 'csv-parse'
import Transaction from '../models/Transaction';
import { getRepository, getCustomRepository, In } from 'typeorm'
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);

    const parsers = csvParser({
      from_line: 2, // linha que inicia
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoriesRepository = getRepository(Category);

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) }
    });

    const existentCategoriesTitles = existentCategories.map((category: Category) => category.title);

    const addCategoryTitles = categories.filter(category => !existentCategoriesTitles.includes(category)).filter((value, index, self) => self.indexOf(value) == index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title
      }))
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const transactionRepository = getCustomRepository(TransactionRepository);
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title == transaction.category
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);
    await fs.promises.unlink(filePath);

    console.log(createdTransactions);

    return createdTransactions;

  }
}

export default ImportTransactionsService;
