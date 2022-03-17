const UNSUPPORTED_MESSAGE = "<font color='#ea9999'>Checksum not available for this file type.</font>";
const HOME_BANNER_IMAGE = "https://i.ibb.co/61252bS/select-file.png";
const HOME_LABEL = "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Select files to view checksum info</b>"

/**
* Called when the user launches the main page of the application.
*
* @param {Object} event - current add-on event
* @return {Card[]} Card(s) to display
*/
function onHomePage(event) {
    var card = buildHomeCard();
    return [card];
}

/**
* Called when a drive item is selected and the application is open.
*
* @param {Object} event - current add-on event
* @return {Card[]} Card(s) to display
*/
function onDriveItemsSelected(event) {
    let selectedFiles = event.drive.selectedItems
        .filter(item => item.mimeType != "application/vnd.google-apps.folder");

    if (selectedFiles.length == 0) {
        var card = buildHomeCard()
        return [card];
    }

    var files = fetchFileDetails(selectedFiles);
    var card = buildFileCard(files);
    return [card];
}

/**
* Renders the home page card.
*
* @return {Card} Home page card
*/
function buildHomeCard() {
    let banner = CardService.newImage().setImageUrl(HOME_BANNER_IMAGE);
    let label = CardService.newTextParagraph().setText(HOME_LABEL);

    let section = CardService.newCardSection()
        .addWidget(banner)
        .addWidget(label);

    return CardService.newCardBuilder()
        .addSection(section)
        .build();
}

/**
* Renders the file hash list card.
*
* @param {Object} Files to display
* @return {Card} File card
*/
function buildFileCard(files) {
    let section = CardService.newCardSection();
    let hashFile = "";

    files.forEach(file => {
        let listItem = CardService.newKeyValue()
            .setTopLabel(file.title);

        if (file.md5Checksum) {
            listItem.setContent(file.md5Checksum);
            hashFile += file.md5Checksum + "  " + file.title + "\n";
        } else {
            listItem.setContent(UNSUPPORTED_MESSAGE);
        }

        section.addWidget(listItem);
    });

    var clickAction = CardService.newAction()
        .setFunctionName('onShowHashFile')
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
        .setParameters({ hashFile });

    let footer = CardService
        .newFixedFooter()
        .setPrimaryButton(
            CardService
                .newTextButton()
                .setText("Generate Hash File")
                .setOnClickAction(clickAction)
        );

    return CardService.newCardBuilder()
        .addSection(section)
        .setFixedFooter(footer)
        .build();
}

/**
* Renders and displays the provided hash file. 
*
* @param {Object} event - current add-on event
* @return {Card[]} Hash file card
*/
function onShowHashFile(event) {
    let section = CardService.newCardSection()
        .setHeader('MD5 Hash File')
        .addWidget(CardService.newTextParagraph().setText(event.parameters.hashFile));

    let card = CardService.newCardBuilder()
        .addSection(section)
        .setDisplayStyle(CardService.DisplayStyle.PEEK)
        .build();

    return [card];
}

/**
* Fetches data on the selected Drive item.
*
* @param {Object} event - current add-on event
* @return {string[]} Array of Drive items.
*/
function fetchFileDetails(items) {
    items.forEach(function (item) {
        var res = Drive.Files.get(item.id, { fields: "md5Checksum" });
        item.md5Checksum = res.md5Checksum;
    });
    return items;
}
