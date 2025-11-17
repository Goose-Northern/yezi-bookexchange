/**
 * 图书数据管理器
 * 提供对LocalStorage中图书数据的增删改查操作
 */
const BookManager = {
    // LocalStorage 键名常量
    STORAGE_KEY: 'bookExchange_books',
    
    /**
     * 获取所有图书
     * @returns {Array} 图书数组
     */
    getAllBooks() {
        try {
            const booksJSON = localStorage.getItem(this.STORAGE_KEY);
            // 如果还没有数据，返回空数组
            return booksJSON ? JSON.parse(booksJSON) : [];
        } catch (error) {
            console.error('读取图书数据失败:', error);
            return [];
        }
    },
    
    /**
     * 保存所有图书到LocalStorage
     * @param {Array} books - 图书数组
     * @returns {boolean} 是否保存成功
     */
    saveAllBooks(books) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));
            return true;
        } catch (error) {
            console.error('保存图书数据失败:', error);
            return false;
        }
    },
    
    /**
     * 添加新图书
     * @param {Object} book - 图书对象
     * @returns {boolean} 是否添加成功
     */
    addBook(book) {
        // 参数验证
        if (!book || !book.title || !book.author || !book.uploader || !book.contact) {
            console.error('图书数据不完整');
            return false;
        }
        
        const books = this.getAllBooks();
        
        // 生成唯一ID（使用时间戳 + 随机数）
        book.id = Date.now() + Math.random().toString(36).substr(2, 9);
        book.createdAt = new Date().toISOString();
        
        books.push(book);
        return this.saveAllBooks(books);
    },
    
    /**
     * 根据ID删除图书
     * @param {string} id - 图书ID
     * @returns {boolean} 是否删除成功
     */
    deleteBook(id) {
        const books = this.getAllBooks();
        const initialLength = books.length;
        
        const filteredBooks = books.filter(book => book.id !== id);
        
        if (filteredBooks.length === initialLength) {
            console.warn('未找到要删除的图书');
            return false;
        }
        
        return this.saveAllBooks(filteredBooks);
    },
    
    /**
     * 搜索图书
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的图书数组
     */
    searchBooks(keyword) {
        if (!keyword.trim()) {
            return this.getAllBooks();
        }
        
        const books = this.getAllBooks();
        const lowerKeyword = keyword.toLowerCase();
        
        return books.filter(book => 
            book.title.toLowerCase().includes(lowerKeyword) || 
            book.author.toLowerCase().includes(lowerKeyword) ||
            book.uploader.toLowerCase().includes(lowerKeyword)
        );
    },
    
    /**
     * 获取图书统计信息
     * @returns {Object} 统计信息对象
     */
    getStats() {
        const books = this.getAllBooks();
        const uploaders = [...new Set(books.map(book => book.uploader))];
        
        return {
            totalBooks: books.length,
            totalUploaders: uploaders.length
        };
    },
    
    /**
     * 导出数据到JSON文件
     */
    exportData() {
        const books = this.getAllBooks();
        const dataStr = JSON.stringify(books, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `books_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    /**
     * 从JSON文件导入数据
     * @param {File} file - JSON文件
     * @returns {Promise} 导入结果的Promise
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedBooks = JSON.parse(e.target.result);
                    
                    // 数据验证
                    if (!Array.isArray(importedBooks)) {
                        throw new Error('文件格式错误：数据不是数组');
                    }
                    
                    // 合并数据（避免重复ID）
                    const existingBooks = this.getAllBooks();
                    const existingIds = new Set(existingBooks.map(book => book.id));
                    
                    const newBooks = importedBooks.filter(book => !existingIds.has(book.id));
                    const mergedBooks = [...existingBooks, ...newBooks];
                    
                    if (this.saveAllBooks(mergedBooks)) {
                        resolve({
                            success: true,
                            imported: newBooks.length,
                            total: mergedBooks.length
                        });
                    } else {
                        reject(new Error('保存导入数据失败'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    },
    
    /**
     * 清空所有图书数据
     * @returns {boolean} 是否清空成功
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
};

// 添加一些示例数据（首次运行时）
document.addEventListener('DOMContentLoaded', function() {
    const books = BookManager.getAllBooks();
    if (books.length === 0) {
        // 添加示例图书
        const sampleBooks = [
            {
                id: 'sample1',
                title: '三体',
                author: '刘慈欣',
                uploader: '小杨',
                contact: 'yby666@example.com',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample2',
                title: '新大学英语 视听说教程 第二版 2',
                author: '潘海英',
                uploader: '小马',
                contact: 'qq:1314520886',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample3',
                title: '工程力学 上册(机械工业出版社)',
                author: '蔡广新 邹春伟',
                uploader: '小王',
                contact: '139131411314',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample4',
                title: '新大学英语 读写教程 第二版 2 思政智慧版',
                author: '郑树棠',
                uploader: '小徐',
                contact: 'vx:wobuyaogun_678',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample5',
                title: '工业设计史 第五版',
                author: '何人可',
                uploader: '小刘',
                contact: 'aiwanpubg998@example.com',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample6',
                title: '中国近代史纲要 2023版',
                author: '本书编写组',
                uploader: '小姚',
                contact: 'vx:noblearchitecturestudent',
                createdAt: new Date().toISOString()
            }
        ];
        
        BookManager.saveAllBooks(sampleBooks);
    }
});