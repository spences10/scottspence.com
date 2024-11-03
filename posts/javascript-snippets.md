---
date: 2019-05-27
title: JavaScript snippets from around the web
tags: ['learning', 'javascript', 'snippets']
isPrivate: false
---

This is a dump of all the snippets I have collected over the last 18
months or so, that I'm going to document here so it's probably going
to be a mess but it's mainly for my reference so 😛

## Arrays

Straight from Wes himself.

🔥 The Array `.some()` Method is super handy for checking if at least
one item in an array meets what you are looking for

```js
const user = {
	name: 'Dave',
	permissions: ['USER', 'CREATE_ITEM'],
}

// check if the user is either admin or can delete in item
const canDelete = user.permissions.some(p =>
	['ADMIN', 'DELETE_ITEM'].includes(p),
)
// canDelete is false

// check if a user is either admin or can create in item
const canCreate = user.permissions.some(p =>
	['ADMIN', 'CREATE_ITEM'].includes(p),
)
// canDelete is true
```

On the same note `.every()` is great for checking every item in an
array meets what you are looking for.

```js
const people = [
	{ name: 'Dave', age: 42 },
	{ name: 'Sue', age: 26 },
	{ name: 'India', age: 9 },
]

const canEveryoneDrink = people.every(p => p.age >= 18)
// false

const canSomeoneDrink = people.some(p => p.age >= 18)
// true

const howManyDrinkers = people.filter(p => p.age >= 18).length
// 2
```

<!-- cSpell:ignore addy,osmani -->

## Via Addy Osmani

Get the unique values of an array in JS. Use ES2015 `Set()` and
`...rest` to discard duplicate values.

```js
const uniqueArray = arr => [...new Set(arr)]

uniqueArray([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 0, 0, 10, 10])
// Array(9) [ 1, 2, 3, 4, 5, 6, 7, 0, 10 ]
uniqueArray([
	'London',
	'Manchester',
	'Cambridge',
	'London',
	'Greater London',
	'London',
	'Manchester',
])
// Array(4) [ "London", "Manchester", "Cambridge", "Greater London" ]
```

`Array.from()` accepts another `.map` arguments. Useful for calling
each element of a created array.

```js
const year = new Date().getFullYear()
const totalYears = 5

Array.from('web')
// Array(3) [ "w", "e", "b" ]

Array.from(Array(totalYears), (_, i) => year + i)
// Array(5) [ 2019, 2020, 2021, 2022, 2023 ]

Array.from({ length: totalYears }, (_, i) => year + i)
// Array(5) [ 2019, 2020, 2021, 2022, 2023 ]
```

## Async await

```js
const getAsyncStuff = async name => {
	try {
		const response = await fetch(
			`https://api.github.com/users/${name}`,
		)
		return await response.json()
	} catch (err) {
		console.error(err)
	}
}
```

🔥 4 Ways to handle the double promise with fetch() and async+await

```js
const url = 'https://api.github.com/users/spences10'

async function go() {
	// 1. tac a promise onto the end
	const p1 = await fetch(url).then(data => data.json())

	// 2. double
	const p2 = await (await fetch(url)).json()

	// 3. capture promise in a variable
	const data = await fetch(url)

	// then convert it on another line
	const p3 = await data.json()

	// 4. create a utility function
	const p4 = await getJSON(url)
}

// use ... spread to get all arguments
function getJSON(...butter) {
	// then spread into the fetch function
	return fetch(...butter).then(data => data.json())
}

go()
```
