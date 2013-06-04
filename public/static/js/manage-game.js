function delete_face(i) {
    form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', '/delete-face/' + facetype);

    input = document.createElement('input');
    input.setAttribute('name', 'faceid');
    input.setAttribute('value', i);

    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    console.log("foo");

    for (i = 0; i < 1000000; i++);

    return false;
}
