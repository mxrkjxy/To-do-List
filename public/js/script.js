document.addEventListener('DOMContentLoaded', function () {
  let app = firebase.app();
  let db = app.firestore();

  let toDate = date => {
    if (date === void 0) {
      return new Date(0);
    }
    if (isDate(date)) {
      return date;
    } else {
      return new Date(parseFloat(date.toString()));
    }
  }

  let isDate = date => {
    return (date instanceof Date);
  }

  let format = (date, format) => {
    let d = toDate(date);
    return format
      .replace(/Y/gm, d.getFullYear().toString())
      .replace(/m/gm, ('0' + (d.getMonth() + 1)).substr(-2))
      .replace(/d/gm, ('0' + (d.getDate() + 1)).substr(-2))
      .replace(/H/gm, ('0' + (d.getHours() + 0)).substr(-2))
      .replace(/i/gm, ('0' + (d.getMinutes() + 0)).substr(-2))
      .replace(/s/gm, ('0' + (d.getSeconds() + 0)).substr(-2));
  }

  //query selectors
  let btnAdd = document.getElementById('btn-add');
  let inputTask = document.getElementById('input-task');
  let pendingList = document.getElementById('pending-list');
  let doneList = document.getElementById('done-list');

  let checkInput = task => {
    if (task === '') {
      btnAdd.disabled = true;
    } else {
      btnAdd.disabled = false;
    }
  }

  let checkIfEmpty = (list) => {}

  //event listeners
  inputTask.addEventListener('keyup', (event) => {
    checkInput(inputTask.value);
    if (event.keyCode === 13) {
      btnAdd.click();
    }
  });

  const loadTask = () => {
    console.log('Loading');
    pendingList.innerHTML = 'Loading...';
    doneList.innerHTML = 'Loading...';
    btnAdd.disabled = true;
    db.collection('toDo')
      .orderBy('dateCreated')
      .get()
      .then((querySnapshot) => {
        pendingList.innerHTML = '';
        doneList.innerHTML = '';
        btnAdd.innerHTML = 'Add';
        querySnapshot.forEach((doc) => {
          // console.log(`${doc.id} => ${doc.data().task} => ${doc.data().dateCreated} => ${doc.data().isDone}`);
          addTask(doc.id, doc.data().task, doc.data().dateCreated, doc.data().isDone);
        });
      });
  };

  const addTask = (id, task, date, status) => {
    let isDone = status;
    let timestamp = format(date, 'Y-m-d H:i:s');
    let listNode = document.createElement('li');
    let btnNode = document.createElement('button');
    let taskNode = document.createElement('p');
    let textNode = document.createElement('p');
    let timeNode = document.createElement('span');
    textNode.contentEditable = true;
    taskNode.appendChild(textNode).innerHTML = task;
    timeNode.innerHTML = timestamp;

    pendingList.addEventListener('keyup', (event) => {
      let str = taskNode.innerHTML;
      let task_edited = str.substring(0, str.indexOf('<'));
      console.log(task_edited);
    });

    btnNode.setAttribute('id', 'tick-box');
    taskNode.setAttribute('id', 'task');
    textNode.setAttribute('id', 'text');
    timeNode.setAttribute('id', 'timestamp');
    listNode.appendChild(btnNode);
    listNode.appendChild(taskNode);
    taskNode.appendChild(timeNode);

    if (isDone) {
      btnNode.setAttribute('class', 'delete');
      btnNode.innerHTML = '×';
      doneList.appendChild(listNode); //to bottom
    } else {
      btnNode.setAttribute('class', 'check');
      btnNode.innerHTML = '✓';
      // pendingList.appendChild(listNode);
      pendingList.insertBefore(listNode, pendingList.childNodes[0]); //to top
    }

    //toggle done and pending
    btnNode.addEventListener('click', () => {
      db.collection('toDo')
        .doc(id)
        .update({
          isDone: !isDone
        })
        .then(() => {
          if (isDone) {
            btnNode.setAttribute('class', 'check');
            btnNode.innerHTML = '✓';
            doneList.removeChild(listNode);
            // pendingList.appendChild(listNode);
            db.collection('toDo').doc(id).delete();
          } else {
            btnNode.setAttribute('class', 'delete');
            btnNode.innerHTML = '×';
            pendingList.removeChild(listNode);
            doneList.appendChild(listNode);
          }
          isDone = !isDone;
        });
    })
  }

  //add task
  btnAdd.addEventListener('click', () => {
    btnAdd.innerHTML = 'Adding...';
    btnAdd.disabled = true;
    let task = inputTask.value;
    let ms = new Date().getTime();
    if (task) {
      db.collection('toDo')
        .add({
          dateCreated: ms,
          task: task || '',
          isDone: false
        })
        .then(docRef => {
          addTask(docRef.id, task, ms, false)
          btnAdd.innerHTML = 'Add';
          btnAdd.disabled = false;
          inputTask.focus();
          inputTask.value = '';
          checkInput(inputTask.value);
        });
    }
  });

  loadTask();

});