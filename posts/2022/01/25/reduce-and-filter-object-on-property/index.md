---
date: 2022-01-25
title: Reduce and filter object on property
tags: ['', '', '']
private: true
---

```js
$: products = items
  .reduce((acc, item) => {
    if (!acc[item.productId]) {
      acc[item] = item
    }
    acc[item.productId] = item
    return acc
  }, [])
  .filter(item => item !== null)
```
