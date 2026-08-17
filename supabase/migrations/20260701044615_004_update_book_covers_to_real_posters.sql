/*
# Update book covers to real poster images

## Changes
Updates cover_image_url for every book to the actual published cover art using
Open Library's free cover API (covers.openlibrary.org/b/isbn/{ISBN}-L.jpg).
This replaces the generic Pexels stock photos with the real book cover posters.
All books are matched by title+author to avoid updating the wrong row.
*/

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg'
WHERE title = '1984' AND author = 'George Orwell';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg'
WHERE title = 'Atomic Habits' AND author = 'James Clear';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg'
WHERE title = 'Brave New World' AND author = 'Aldous Huxley';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780486415871-L.jpg'
WHERE title = 'Crime and Punishment' AND author = 'Fyodor Dostoevsky';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg'
WHERE title = 'Dune' AND author = 'Frank Herbert';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg'
WHERE title = 'Educated' AND author = 'Tara Westover';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780060853976-L.jpg'
WHERE title = 'Good Omens' AND author = 'Terry Pratchett & Neil Gaiman';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg'
WHERE title = 'Pride and Prejudice' AND author = 'Jane Austen';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg'
WHERE title = 'Project Hail Mary' AND author = 'Andy Weir';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg'
WHERE title = 'Sapiens: A Brief History of Humankind' AND author = 'Yuval Noah Harari';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg'
WHERE title = 'The Alchemist' AND author = 'Paulo Coelho';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg'
WHERE title = 'The Catcher in the Rye' AND author = 'J.D. Salinger';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg'
WHERE title = 'The Da Vinci Code' AND author = 'Dan Brown';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg'
WHERE title = 'The Great Gatsby' AND author = 'F. Scott Fitzgerald';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg'
WHERE title = 'The Hobbit' AND author = 'J.R.R. Tolkien';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg'
WHERE title = 'The Midnight Library' AND author = 'Matt Haig';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg'
WHERE title = 'The Psychology of Money' AND author = 'Morgan Housel';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg'
WHERE title = 'The Silent Patient' AND author = 'Alex Michaelides';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9781408821985-L.jpg'
WHERE title = 'The Song of Achilles' AND author = 'Madeline Miller';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg'
WHERE title = 'To Kill a Mockingbird' AND author = 'Harper Lee';

UPDATE books SET cover_image_url = 'https://covers.openlibrary.org/b/isbn/9780735219090-L.jpg'
WHERE title = 'Where the Crawdads Sing' AND author = 'Delia Owens';
