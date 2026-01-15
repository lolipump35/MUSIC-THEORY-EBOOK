// TEST 
// sélectionne toutes les notes
const notes = document.querySelectorAll('.allNotes');

notes.forEach(note => {
  note.addEventListener('click', () => {
    // toggle la classe 'active'
    note.classList.toggle('active');
  });
});

    