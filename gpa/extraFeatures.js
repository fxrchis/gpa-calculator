/*const container = document.querySelector('.select-con');
const select = document.querySelector('select');
const span = document.querySelector('.title');
const icon = document.querySelector('.icon');

container.addEventListener('mousedown', e=> {
    e.preventDefault();
    const secondSelect = container.children[0];
    const thirdSelect = container.children[1];
    const ul = document.createElement('ul');
    [...secondSelect.children].forEach(option => {
        const li = document.createElement('li');
        li.textContent=option.textContent;

        li.addEventListener('mousedown', e => {
            e.stopPropagation();
            select.value=option.value;
            container.value=option.value;

            select.style.border = '2px solid #426CDF';
            span.style.color = '#426CDF';
            icon.style.color = '#426CDF';
            ul.remove();
        });
        ul.appendChild(li);
    });
    container.appendChild(ul);
    document.addEventListener('click', e => {
        if (!container.contains(e.target)) {
            select.style.border = '1.9px solid gray';
            span.style.color = 'gray';
            icon.style.color = 'gray';
        }
    });
});*/