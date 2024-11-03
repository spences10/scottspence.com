---
date: 2023-08-13
title: HTML Input Types and Uses
tags: ['html', 'notes']
isPrivate: false
---

I came across one of those infographic's today detailing a couple of
uses of the HTML `input` tag and decided to dig a bit deeper into the
uses for it and was quite surprised to find quite a few I didn't know
of.

This is a reference primarily for me detailing the types and their
uses. But as the saying goes, "Knowledge shared is knowledge doubled."
If even one person finds this useful, I'll consider it a win.

## `text`

- Description: A single-line text input field.
- Use case: Capturing names, addresses, search queries, etc.
- Example:

```html
<input
	type="text"
	name="username"
	placeholder="Enter your username"
/>
```

<input
  type="text"
  name="username"
  placeholder="Enter your username"
  class="input input-primary border border-primary"
/>

## `password`

- Description: Similar to "text" but the characters entered are
  obscured.
- Use case: Capturing password or any confidential information.
- Example:

```html
<input
	type="password"
	name="password"
	placeholder="Enter your password"
/>
```

<input 
  type="password"
  name="password"
  placeholder="Enter your password"
  class="input input-primary border border-primary"
/>

## `submit`

- Description: A button that submits the form.
- Use case: Submitting form data to the server.
- Example:

```html
<input type="submit" value="Submit" />
```

<input type="submit" value="Submit" class="btn btn-primary" />

## `reset`

- Description: A button that resets all the form inputs to their
  default values.
- Use case: Letting users easily clear out the form.
- Example:

```html
<input type="reset" value="Reset" />
```

<input type="reset" value="Reset" class="btn btn-primary" />

## `radio`

- Description: Allows selection among multiple options but only one
  can be selected.
- Use case: Choosing gender, age groups, or any single-choice
  scenario.
- Example:

```html
<input type="radio" name="gender" value="male" /> Male
<input type="radio" name="gender" value="female" /> Female
```

<input
  type="radio"
  name="gender"
  value="male"
  class="radio radio-primary"
/> Male

<input
  type="radio"
  name="gender"
  value="female"
  class="radio radio-primary"
  checked
/> Female

## `checkbox`

- Description: A box that can be toggled. Multiple boxes can be
  checked.
- Use case: Selecting multiple interests, settings, or any
  multi-choice scenario.
- Example:

```html
<input type="checkbox" name="interest" value="books" /> Books
<input type="checkbox" name="interest" value="movies" /> Movies
```

<input
  type="checkbox"
  name="interest"
  value="books"
  class="checkbox checkbox-primary"
/> Books

<input
  type="checkbox"
  name="interest"
  value="movies"
  class="checkbox checkbox-primary"
  checked
/> Movies

## `button`

- Description: A clickable button. It doesn't have a default
  behaviour.
- Use case: To trigger JavaScript actions.
- Example:

```html
<input
	type="button"
	value="Click me"
	onclick="{() => alert('Hello!')}"
/>
```

<input
  type="button"
  value="Click me"
  onclick="{() => alert('Hello!')}"
  class="btn btn-primary"
/>

## `color`

- Description: Allows users to pick a color.
- Use case: Picking a favourite color, setting theme color, etc.
- Example:

```html
<input type="color" name="fav-color" value="#663399" />
```

<input type="color" name="fav-color" value="#663399">

## `date`

- Description: Allows users to select a date.
- Use case: Choosing birthdate, event date, etc.
- Example:

```html
<input type="date" name="birth-date" />
```

<input
  type="date"
  name="birth-date"
  class="input input-primary border border-primary"
/>

## `datetime-local`

- Description: Allows users to pick a date and time, without the time
  zone.
- Use case: Setting reminders, events, etc.
- Example:

```html
<input type="datetime-local" name="event-time" />
```

<input
  type="datetime-local"
  name="event-time"
  class="input input-primary border border-primary"
/>

## `email`

- Description: For inputting email addresses.
- Use case: Capturing user email for registration, subscriptions, etc.
- Example:

```html
<input type="email" name="email" placeholder="Enter your email" />
```

<input
  type="email"
  name="email"
  placeholder="Enter your email"
  class="input input-primary border border-primary"
/>

## `file`

- Description: Lets users select one or more files.
- Use case: Uploading images, documents, etc.
- Example:

```html
<input type="file" name="my-file" />
```

<input
  type="file"
  name="my-file"
  class="file-input file-input-bordered file-input-primary w-full max-w-xs"
/>

## `hidden`

- Description: Holds data that the user doesn't see but is submitted
  with the form.
- Use case: Storing session data, user ID, etc.
- Example:

```html
<input type="hidden" name="userID" value="12345" />
```

## `image`

- Description: A graphical submit button.
- Use case: Using an image as a submit button.
- Example:

```html
<input type="image" src="submit.png" alt="Submit Button" />
```

<input
  type="image"
  src="https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto,h_64,w_64/v1691271320/scottspence.com/site-assets/feather.png"
  alt="Submit Button"
  class="w-16 h-16 p-2 border border-primary rounded-box"
/>

## `month`

- Description: Lets users select a month and year.
- Use case: Selecting a month for monthly reports, subscriptions, etc.
- Example:

```html
<input
	type="month"
	name="select-month"
	placeholder="YYYY-MM"
	pattern="\d{4}-\d{2}"
/>
```

<input
  type="month"
  name="select-month"
  placeholder="YYYY-MM"
  pattern="\d{4}-\d{2}"
  class="input input-primary border border-primary"
/>

## `number`

- Description: For inputting numbers.
- Use case: Age, quantity of items, etc.
- Example:

```html
<input type="number" name="age" min="0" max="100" />
```

<input
  type="number"
  name="age"
  min="0"
  max="100"
  class="input input-primary border border-primary"
/>

## `range`

- Description: A slider control to input a number in a range.
- Use case: Setting volume, brightness, or any other sliding scale
  value.
- Example:

```html
<input type="range" name="volume" min="0" max="10" />
```

<input
  type="range"
  name="volume"
  min="0"
  max="10"
  class="range range-primary"
/>

## `search`

- Description: A search field.
- Use case: Search bars on websites.
- Example:

```html
<input type="search" name="query" placeholder="Search..." />
```

<input
  type="search"
  name="query"
  placeholder="Search..."
  class="input input-primary border border-primary"
/>

## `tel`

- Description: For inputting telephone numbers.
- Use case: Capturing user's phone number.
- Example:

```html
<input
	type="tel"
	name="phone"
	placeholder="Enter your phone number"
/>
```

<input
  type="tel"
  name="phone"
  placeholder="Enter your phone number"
  class="input input-primary border border-primary"
/>

## `time`

- Description: Lets users select a time (hour and minute, and
  optionally second).
- Use case: Setting an alarm, choosing a time for a reservation, etc.
- Example:

```html
<input type="time" name="alarm-time" />
```

<input
  type="time"
  name="alarm-time"
  class="input input-primary border border-primary"
/>

## `url`

- Description: For inputting URLs.
- Use case: Capturing user's website, promotional links, etc.
- Example:

```html
<input
	type="url"
	name="website"
	placeholder="Enter your website URL"
/>
```

<input
  type="url"
  name="website"
  placeholder="Enter your website URL"
  class="input input-primary border border-primary"
/>

## `week`

- Description: Lets users select a week.
- Use case: Choosing a week for scheduling, reporting, etc.
- Example:

```html
<input type="week" name="selectWeek" />
```

<input
  type="week"
  name="selectWeek"
  class="input input-primary border border-primary"
/>
