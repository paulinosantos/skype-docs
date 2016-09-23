/// <reference path="../../../framework.d.ts" />
(function () {
    'use strict';

    const content = window.framework.findContentDiv();
    var conversation;
    var listeners = [];

    window.framework.bindInputToEnter(<HTMLInputElement>content.querySelector('.id'));
    window.framework.bindInputToEnter(<HTMLInputElement>content.querySelector('.id2'));
    window.framework.bindInputToEnter(<HTMLInputElement>content.querySelector('.messageToSend'));

    function cleanUI () {
        (<HTMLInputElement>content.querySelector('.id')).value = '';
        (<HTMLInputElement>content.querySelector('.id2')).value = '';
        (<HTMLInputElement>content.querySelector('.messageToSend')).value = '';
        (<HTMLElement>content.querySelector('.messages')).innerHTML = '';
    }

    function cleanupConversation () {
        if (conversation.state() !== 'Disconnected') {
            conversation.leave().then(() => {
                conversation = null;
            });
        } else {
            conversation = null;
        }
    }

    function reset (bySample : Boolean) {
        // remove any outstanding event listeners
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].dispose();
        }
        listeners = [];

        if (conversation)
        {
            if (bySample) {
                cleanupConversation();
                cleanUI();
            } else {
                const result = window.confirm('Leaving this sample will end the conversation.  Do you really want to leave?');
                if (result) {
                    cleanupConversation();
                    cleanUI();
                }

                return result;
            }
        } else {
            cleanUI();
        }
    }

    window.framework.registerNavigation(reset);
    window.framework.addEventListener(content.querySelector('.call'), 'click', () => {
        const conversationsManager = window.framework.application.conversationsManager;
        const id = (<HTMLInputElement>content.querySelector('.id')).value;
        const id2 = (<HTMLInputElement>content.querySelector('.id2')).value;
        window.framework.reportStatus('Inviting Participants...', window.framework.status.info);
        // @snippet
        conversation = conversationsManager.createConversation();

        listeners.push(conversation.selfParticipant.chat.state.when('Connected', () => {
            window.framework.reportStatus('Connected to Chat', window.framework.status.success);
        }));
        listeners.push(conversation.participants.added(person => {
            window.console.log(person.displayName() + ' has joined the conversation');
        }));
        listeners.push(conversation.chatService.messages.added(item => {
            window.framework.addMessage(item, <HTMLElement>content.querySelector('.messages'));
        }));
        listeners.push(conversation.state.changed((newValue, reason, oldValue) => {
            if (newValue === 'Disconnected' && (oldValue === 'Connected' || oldValue === 'Connecting')) {
                window.framework.reportStatus('Conversation Ended', window.framework.status.reset);
                reset(true);
            }
        }));

        conversation.participants.add(id);
        conversation.participants.add(id2);
        conversation.chatService.start().then(null, error => {
            window.framework.reportError(error, reset);
        });
        // @end_snippet
    });
    window.framework.addEventListener(content.querySelector('.send'), 'click', () => {
        const message = <HTMLInputElement>content.querySelector('.messageToSend');
        conversation.chatService.sendMessage(message.value).then(function () {
            message.value = '';
        });
    });
    window.framework.addEventListener(content.querySelector('.end'), 'click', () => {
        window.framework.reportStatus('Ending Conversation...', window.framework.status.info);
        // @snippet
        conversation.leave().then(() => {
            window.framework.reportStatus('Conversation Ended', window.framework.status.reset);
        }, window.framework.reportError).then(() => {
            reset(true);
        });
        // @end_snippet
    });
})();
