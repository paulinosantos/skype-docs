/// <reference path="../../../framework.d.ts" />
(function () {
    'use strict';

    const content = window.framework.findContentDiv();
    const groups = {};

    window.framework.bindInputToEnter(<HTMLInputElement>content.querySelector('.id'));

    window.framework.application.personsAndGroupsManager.all.groups.subscribe();
    window.framework.application.personsAndGroupsManager.all.groups.added(group => {
        group.name.get();
        group.name.changed(value => {
            if (!groups[value] && group.type() !== 'Distribution') {
                const option = document.createElement('option');
                option.value = value;
                option.innerHTML = value;
                content.querySelector('.groupsSelect').appendChild(option);
                groups[value] = group;
            }
        });
    });
    window.framework.application.personsAndGroupsManager.all.groups.removed(group => {
        delete groups[group.name()];
        const option = content.querySelector('.groupsSelect option[value="' + group.name() + '"]');
        content.querySelector('.groupsSelect').removeChild(option);
    });

    function reset () {
        (<HTMLInputElement>content.querySelector('.id')).value = '';
        (<HTMLSelectElement>content.querySelector('.groupsSelect')).selectedIndex = 0;
    }

    window.framework.registerNavigation(reset);
    window.framework.addEventListener(content.querySelector('.add'), 'click', () => {
        const id = (<HTMLInputElement>content.querySelector('.id')).value;
        const group = groups[(<HTMLOptionElement>content.querySelector('.groupsSelect option:checked')).value];
        window.framework.reportStatus('Adding Contact...', window.framework.status.info);
        // @snippet
        group.persons.add(id).then(() => {
            window.framework.reportStatus('Contact Added', window.framework.status.success);
        }, error => {
            window.framework.reportError(error);
        }).then(reset);
        // @end_snippet
    });
})();
