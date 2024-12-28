/**
 * [
 *    {
 *      id: <int>
 *      title: <string>
 *      author: <string>
 *      year: <int>
 *      isComplete: <boolean>
 *    }
 * ]
 */

const books = [];
const RENDER_EVENT = 'render-book';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function findBook(bookId) {
  return books.find((book) => book.id === bookId);
 }

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function makeBook(bookObject) {
  const {id, title, author, year, isComplete} = bookObject;

  // book item
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title;
  bookTitle.setAttribute('data-testid', 'bookItemTitle');

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = "Penulis: " + author;
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const bookYear = document.createElement('p');
  bookYear.innerText = "Tahun: " + year;
  bookYear.setAttribute('data-testid', 'bookItemYear');

  const bookContainer = document.createElement('div');
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  // button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Hapus Buku';
  deleteButton.classList.add('red');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.addEventListener('click', function () {
    deleteBook(id);
  });

  const IsCompleteButton = document.createElement('button');
  IsCompleteButton.textContent = isComplete ? 'Belum Selesai Dibaca' : 'Selesai Dibaca';
  IsCompleteButton.classList.add('green');
  IsCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  IsCompleteButton.addEventListener('click', function () {
    IsCompleteBookCompletion(id);
  });

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit Buku';
  editButton.classList.add('orange');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.addEventListener('click', function () {
    editBook(id);
  });

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action');
  actionContainer.append(IsCompleteButton, deleteButton, editButton);


  const container = document.createElement('div');
  container.classList.add("book_item");
  container.setAttribute('data-bookid', id);
  container.setAttribute('data-testid', 'bookItem');
  container.append(bookContainer, actionContainer);

  return container;
}

function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = Number(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);

  document.getElementById('bookForm').reset();

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function IsCompleteBookCompletion(bookId) {
  const bookTarget = findBook(bookId);
  if (!bookTarget) return;

  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: 'Buku ini akan dihapus secara permanen.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      books.splice(bookTarget, 1);

      Swal.fire(
        'Terhapus!',
        'Buku telah berhasil dihapus.',
        'success'
      );

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  });
}
function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (!bookTarget) return;

  const newTitle = prompt('Edit Judul:', bookTarget.title);
  const newAuthor = prompt('Edit Penulis:', bookTarget.author);
  const newYear = prompt('Edit Tahun:', bookTarget.year);
  if (newTitle && newAuthor && newYear) {
    bookTarget.title = newTitle;
    bookTarget.author = newAuthor;
    bookTarget.year = Number(newYear);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(searchTitle));

    const uncompletedBookList = document.getElementById('incompleteBookList');
    const completedBookList = document.getElementById('completeBookList');
    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';

    for (const book of filteredBooks) {
      const bookElement = makeBook(book);
      if (book.isComplete) {
        completedBookList.append(bookElement);
      } else {
        uncompletedBookList.append(bookElement);
      }
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});


document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookList');
  const completedBookList = document.getElementById('completeBookList');

  uncompletedBookList.innerHTML = '';
  completedBookList.innerHTML = '';

  for (bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completedBookList.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});
