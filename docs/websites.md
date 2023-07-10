# Uniweb websites

There are 3 different types of websites that can be created with Uniweb.

- **Profile website**: A website that is made from the data in a selected Uniweb profile of any type except for the special `docufolio` type.
- **Docufolio website**: A custom website that is made from the data in a profile of type `docufolio`.
- **Network website**: the public side of a Uniweb application, which includes standard and custom pages. There can be only one network website per Uniweb instance. The network type is discussed in a [another document](https://github.com/uniwebcms/app-components-template/blob/main/README.md).

All types of websites allow for the selection of a remote module that defines the web components to use to render the contents of the website.

## Profile websites

The concept of a **Profile website** is novel. It's a model that requires minimal effort from users and leverages data-entry efforts by updating both institutional web profiles and websites at the same time.

For many end users, the Profile websites are very appealing because they are self building, and it is easy to experiment with different templates with only a few clicks.

[Web components](components.md) made for a Profile website must allocate extra effort to ensure that the  components have self-building intelligence so that they respond well to profiles with different amounts of information in them. 

It is also important to provide pre-saved [web themes](webthemes.md) that add an extra layer of personalization to a template so that there are interesting variations in looks even when users choose the same template.

## Docufolio websites

The concept of a **Docufolio website** is "standard" in some ways and novel in other ways. It is standard in that the a folder and page structure of a site maps naturally to the hierarchy of topics defined in a docufolio. The novel aspect is that the contents of a page are defined in terms of free-form articles and specialied properties.

A Docufolio website provides the ultimate level of freedom regarding contents and design.

A Docufolio website can also be given a template. So templates can be made for both Profile and Docufolio websites.

## Next step

- [Web components](components.md)