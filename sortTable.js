const sortable = (elIdOrEl, localStorageName, callback) => {
	var list;

	if (typeof elIdOrEl == 'object') {
		list = elIdOrEl;
	} else if (typeof elIdOrEl == 'string') {
		list = document.getElementById(elIdOrEl);
	} else {
		list = document.body;
	}
	let draggedItem = null;
	list.addEventListener('dragstart', (e) => {
		draggedItem = e.target;
		e.dataTransfer.setData('text/plain', '');
		e.target.style.opacity = '0.5';
	});

	list.addEventListener('dragover', (e) => {
		e.preventDefault();
		const afterElement = getDragAfterElement(list, e.clientY, draggedItem);

		if (afterElement == null) {
			list.appendChild(draggedItem);
		} else {
			list.insertBefore(draggedItem, afterElement);
		}
	});

	list.addEventListener('dragend', (e) => {
		e.target.style.opacity = '1';
		const sortedArray = getSortedArray(list);
		callback(sortedArray);
		if (localStorageName) localStorage.setItem(localStorageName, JSON.stringify(sortedArray));
	});

	function getDragAfterElement(list, y, draggedItem) {
		const draggableElements = [...list.querySelectorAll('[draggable="true"]:not(.dragging)')];
		return draggableElements.reduce(
			function (closest, child) {
				const box = child.getBoundingClientRect();
				const offset = y - box.top - box.height / 2;
				if (offset < 0 && offset > closest.offset) {
					return { offset: offset, element: child };
				} else {
					return closest;
				}
			},
			{ offset: Number.NEGATIVE_INFINITY },
		).element;
	}

	const getSortedArray = (list) => {
		const items = list.querySelectorAll('[data-value]');
		const sortedArray = Array.from(items).map(function (item) {
			return {
				name: item.textContent,
				index: parseInt(item.dataset.index),
			};
		});
		return sortedArray;
	};

	// load sorted list from local storage
	if (localStorageName) {
		const sortableList = JSON.parse(localStorage.getItem(localStorageName));
		if (sortableList) {
			sortableList.forEach((item) => {
				const listItem = document.querySelector(`${id}[data-index="${item.index}"]`);
				if (listItem) {
					list.appendChild(listItem);
				}
			});
		}
	}
};
