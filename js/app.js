$(document).ready(function () {
	const welcomeText = `
Welcome to NoteKeeper!

NoteKeeper is your go-to note-taking app designed to streamline your productivity. Capture your thoughts, ideas, and important information effortlessly, all in one place. With a user-friendly interface and powerful features, NoteKeeper helps you stay organized and focused.

Create, edit, and organize your notes with ease. Customize your formatting, use folders and tags to keep everything in order, and set reminders to stay on track. But that's not all - upgrade to NoteKeeper+ for advanced features that take your note-taking to the next level.

With NoteKeeper+, you can enjoy additional benefits such as cloud sync across devices, collaborative sharing, and priority customer support. Unlock the full potential of NoteKeeper and make the most of your productivity.

Download NoteKeeper now and experience the convenience of organized note-taking. Upgrade to NoteKeeper+ for an enhanced note-taking experience with exclusive features. Start taking your productivity to new heights today!

Happy note-keeping!
The NoteKeeper Team`;

	const darkmodeText = 'Enable dark mode [Ctrl/Cmd + M]';
	const lightmodeText = 'Enable light mode [Ctrl/Cmd + M]';
	const darkMetaColor = '#0d1117';
	const lightMetaColor = '#4d4d4d';
	const metaThemeColor = document.querySelector('meta[name=theme-color]');
	const { notepad, state, setState, removeState, get } = selector();

	const editorConfig = {
		defaultFontSize: 18,
		defaultLineHeight: 26,
		defaultFontWeight: 'normal',
		defaultShowWordCountPill: 'Yes',
	};

	const themeConfig = {
		lightmodeText, 
		darkmodeText, 
		lightMetaColor, 
		darkMetaColor, 
		metaThemeColor
	};

	const noteItem = state.note && state.note != '' ? state.note : welcomeText;
	const characterAndWordCountText = calculateCharactersAndWords(noteItem);
	notepad.wordCount.text(characterAndWordCountText);
	notepad.note.val(noteItem);

	if (!state.isUserPreferredTheme) {
		setState('isUserPreferredTheme', 'false');
	}

	if (state.userChosenFontSize) {
		notepad.note.css('font-size', state.userChosenFontSize + 'px');
		notepad.fontSize.val(state.userChosenFontSize);
	} else {
		resetFontSize(editorConfig.defaultFontSize);
	}

	if (state.userChosenFontWeight) {
		notepad.note.css('font-weight', state.userChosenFontWeight);
		notepad.fontWeight.val(state.userChosenFontWeight);
	} else {
		resetFontWeight(editorConfig.defaultFontWeight);
	}

	if (state.userChosenLineHeight) {
		notepad.note.css('line-height', state.userChosenLineHeight + 'px');
		notepad.lineHeight.val(state.userChosenLineHeight);
	} else {
		resetLineHeight(editorConfig.defaultLineHeight);
	}

	const userChosenWordCountPillSelected = state.userChosenWordCountPillSelected

	if (userChosenWordCountPillSelected) {
		userChosenWordCountPillSelected === 'Yes' ? notepad.wordCountContainer.show() : notepad.wordCountContainer.hide();
		notepad.showWordCountPill.val(userChosenWordCountPillSelected);
	} else {
		resetShowWordCountPill(editorConfig.defaultShowWordCountPill);
	}

	if (state.mode && state.mode === 'dark') {
		enableDarkMode(lightmodeText, darkMetaColor, metaThemeColor);
	} else {
		enableLightMode(darkmodeText, lightMetaColor, metaThemeColor);
	}

	notepad.note.keyup(debounce(function () {
		const characterAndWordCountText = calculateCharactersAndWords(get(this).val());
		notepad.wordCount.text(characterAndWordCountText);
		setState('note', get(this).val());
	}, 500));
	
	notepad.clearNotes.on('click', function () {
		Swal.fire({
			title: 'Want to delete notes?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Delete'
		}).then((result) => {
			if (result.value) {
				notepad.note.val('').focus();
				setState('note', '');

				Swal.fire(
					'Deleted!',
					'Your notes has been deleted.',
					'success'
				)
			}
		})
	});

	notepad.mode.click(function () {
		toggleTheme(themeConfig);
	});

	notepad.copyToClipboard.click(function () {
		copyNotesToClipboard(notepad.note.val());
	})

	notepad.downloadNotes.click(function () {
		saveTextAsFile(note.value, getFileName());
	})

	setTimeout(function () {
		if (!state.hasUserDismissedDonationPopup) {
			notepad.stickyNotice.toggleClass('make-hidden');
		}
	}, 30000);

	notepad.closeDonationPopup.click(function () {
		notepad.stickyNotice.remove();
		setState('hasUserDismissedDonationPopup', 'true');
	});

	notepad.fontSize.on('change', function (e) {
		const fontSizeSelected = this.value;

		notepad.note.css('font-size', fontSizeSelected + 'px');
		setState('userChosenFontSize', fontSizeSelected);
	});

	notepad.lineHeight.on('change', function (e) {
		const lineHeightSelected = this.value;

		notepad.note.css('line-height', lineHeightSelected + 'px');
		setState('userChosenLineHeight', lineHeightSelected);
	});

	notepad.fontWeight.on('change', function (e) {
		const fontWeightSelected = this.value;

		notepad.note.css('font-weight', fontWeightSelected);
		setState('userChosenFontWeight', fontWeightSelected);
	});

	notepad.showWordCountPill.on('change', function (e) {
		const showWordCountPillSelected = this.value;

		showWordCountPillSelected === 'Yes' ? notepad.wordCountContainer.show() : notepad.wordCountContainer.hide();
		setState('userChosenWordCountPillSelected', showWordCountPillSelected);
	});

	notepad.resetPreferences.click(function () {
		if (selector().state.userChosenFontSize) {	
			removeState('userChosenFontSize');
			resetFontSize(editorConfig.defaultFontSize);
		}
			
		if (selector().state.userChosenLineHeight) {
			removeState('userChosenLineHeight');
			resetLineHeight(editorConfig.defaultLineHeight);
		}

		if (selector().state.userChosenFontWeight) {
			removeState('userChosenFontWeight');
			resetFontWeight(editorConfig.defaultFontWeight);
		}

		if (selector().state.userChosenWordCountPillSelected) {
			removeState('userChosenWordCountPillSelected');
			resetShowWordCountPill(editorConfig.defaultShowWordCountPill);
		}
	});

	// This changes the application's theme when 
	// user toggles device's theme preference
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isSystemDarkModeEnabled }) => {
		// To override device's theme preference
		// if user sets theme manually in the app
		if (state.isUserPreferredTheme === 'true') {
			return;
		}

		isSystemDarkModeEnabled
			? enableDarkMode(lightmodeText, darkMetaColor, metaThemeColor)
			: enableLightMode(darkmodeText, lightMetaColor, metaThemeColor)
	});

	// This sets the application's theme based on
	// the device's theme preference when it loads
	if (!state.isUserPreferredTheme || state.isUserPreferredTheme === 'false') {
		window.matchMedia('(prefers-color-scheme: dark)').matches
			? enableDarkMode(lightmodeText, darkMetaColor, metaThemeColor)
			: enableLightMode(darkmodeText, lightMetaColor, metaThemeColor);
	} 

	if (getPWADisplayMode() === 'standalone') {
		notepad.installApp.hide();
	}

	window.matchMedia('(display-mode: standalone)').addEventListener('change', ({ matches }) => {
		if (matches) {
			notepad.installApp.hide();
		} else {
			notepad.installApp.show();
		}
	});

	document.onkeydown = function (event) {
		event = event || window.event;

		if (event.key === 'Escape') {
			$('.modal').modal('hide');
		} 
		
		if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
			saveTextAsFile(note.value, getFileName());
			event.preventDefault();
		}

		if ((event.ctrlKey || event.metaKey) && event.code === 'Comma') {
			event.preventDefault();

			if (notepad.preferencesModal.hasClass('in'))
				return;

			$('.modal').modal('hide');
			notepad.preferencesModal.modal('show');
		}

		if ((event.ctrlKey || event.metaKey) && event.code === 'KeyK') {
			event.preventDefault();

			if (notepad.keyboardShortcutsModal.hasClass('in'))
				return;

			$('.modal').modal('hide');
			notepad.keyboardShortcutsModal.modal('show');
		}

		if ((event.ctrlKey || event.metaKey) && event.code === 'KeyM') {
			event.preventDefault();
			toggleTheme(themeConfig);
		}

		if (event.altKey && event.code === 'KeyC') {
			event.preventDefault();
			copyNotesToClipboard(notepad.note.val());
		}
	};
});

// Registering ServiceWorker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js').then(function (registration) {
		console.log('ServiceWorker registration successful with scope: ', registration.scope);
	}).catch(function (err) {
		console.log('ServiceWorker registration failed: ', err);
	});
}

let deferredPrompt;
let installSource;

window.addEventListener('beforeinstallprompt', (e) => {
	selector().notepad.installAppButtonContainer.show();
	deferredPrompt = e;
	installSource = 'nativeInstallCard';

	e.userChoice.then(function (choiceResult) {
		if (choiceResult.outcome === 'accepted') {
			deferredPrompt = null;
		}

		ga('send', {
			hitType: 'event',
			eventCategory: 'pwa-install',
			eventAction: 'native-installation-card-prompted',
			eventLabel: installSource,
			eventValue: choiceResult.outcome === 'accepted' ? 1 : 0
		});
	});
});

const installApp = document.getElementById('installApp');

installApp.addEventListener('click', async () => {
	installSource = 'customInstallationButton';

	if (deferredPrompt !== null) {
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			deferredPrompt = null;
		}

		ga('send', {
			hitType: 'event',
			eventCategory: 'pwa-install',
			eventAction: 'custom-installation-button-clicked',
			eventLabel: installSource,
			eventValue: outcome === 'accepted' ? 1 : 0
		});
	} else {
		showToast('Notepad is already installed.')
	}
});

window.addEventListener('appinstalled', () => {
	deferredPrompt = null;

	const source = installSource || 'browser';

	ga('send', 'event', 'pwa-install', 'installed', source);
});