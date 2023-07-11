# Block's Content

`block.content`

```javascript
const parsedData = parse(content);

this.main = parsedData?.metadata || {};
this.items = parsedData?.data || [];
```

```javascript
let body = {
    imgs: [],
    videos: [],
    lists: [],
    links: [],
    headings: [],
    paragraphs: [],
    properties: [],
    propertyBlocks: [],
};
```

```javascript
const parse = (article) => {
    const elements = splitItems(article?.content || []);

    if (!elements.length) {
        return {};
    } else if (elements.length === 1) {
        return { metadata: parseItem(elements[0]) };
    } else {
        let data = [];

        for (const item of elements) {
            data.push(parseItem(item));
        }

        // Get all items after the first one
        let items = data.slice(1);

        // If the first item has a title (H1) and all other items
        // don't have one, then the first item is a special case
        if (data[0]?.header?.title && !items.filter((item) => item?.header?.title).length) {
            return { metadata: data[0], data: items };
        } else {
            return { data };
        }
    }
};
```

```javascript
const parseItem = (data) => {
    let banner, header, body;
    let headerStartIndex = 0;
    let bannerStartIndex = 0;
    let i = 0;

    while (i < data.length) {
        let item = data[i];

        let itemType = item?.type;
        let itemAttrs = item?.attrs;
        let content = item?.content || [];

        // Ignore empty paragraph
        if (itemType === 'paragraph' && !content.length) {
            bannerStartIndex++;
            headerStartIndex++;
            i++;
            continue;
        }

        // Found the banner
        if (i === bannerStartIndex && itemType === 'ImageBlock' && !banner) {
            banner = parseImgBlock(itemAttrs);

            //If we found the banner, the header settings may start from second element
            headerStartIndex++;
            i++;
            continue;
        }

        // Try to find the heading settings. label, title, subtitle, description
        // Possible combinations:
        // H1, H1 [H2] [H3], H2 H1 [H2] [H3], [H2] [H3]
        if (i === headerStartIndex && itemType === 'heading' && !header) {
            let level = itemAttrs?.level;

            header = {};

            let tgtIndex = i;

            // Handle the special case which starts with H2 and follow with a H1
            if (level === 2) {
                let nextIndex = getNextNoneEmptyIndex(data, i);

                if (nextIndex > data.length) {
                    i = nextIndex;
                    break;
                }

                let next = data[nextIndex];
                let nextType = next?.type;
                let nextAttrs = next?.attrs;

                if (nextType === 'heading' && nextAttrs?.level === 1) {
                    header.subheading = parseHeading(content);

                    tgtIndex = nextIndex;
                }
            }

            let { header: parsedHeader, nextIndex: parsedIndex } = parseHeader(data, tgtIndex);

            header = { ...header, ...parsedHeader };

            i = parsedIndex;
            break;
        }

        break;
    }

    if (i < data.length) body = parseGeneircData(data.slice(i));

    return {
        header,
        banner,
        body,
    };
};
```
