# `babel-plugin-react-anonymous-display-name`

## Motivation

![alt text](https://raw.githubusercontent.com/patrykkopycinski/eslint-plugin-no-memo-displayname/master/assets/anonymous-memo.png 'motivation')

Babel plugin that fixes displaying, in react devtools, components wrapped by `React.memo` and `forwardRef` as `Anonymous`.

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-react-anonymous-display-name
```

or using yarn:

```sh
yarn add babel-plugin-react-anonymous-display-name --dev
```

## How does this work?

If you also prefer using arrow functions the only way to get proper component names in react devtools right now is:

```js
// doesn't work :(
export const Memo = React.memo(() => <div />);
Memo.displayName = 'Memo';

// works
const MyComponent = React.memo(function MyComponent(props) {
  return <div />;
});

// works too
const MemoComponent = () => <div />;
export const Memo = React.memo(MemoComponent);
```

But it leads to the unnecessary code and in bigger projects I can be an issue. This plugin fixes the issue by transforming anonymous arrow function into named function with name taken from the variable

```js
const Memo = React.memo(() => <div />);
```

into:

```js
const Memo = React.memo(function Memo() {
  return <div />;
});
```

### Eslint plugin

As you don't have to set `displayName` manually anymore, here is Eslint plugin that will help you to find places where you defined `displayName` on `memo()` components:

- [eslint-plugin-no-memo-displayname](https://github.com/patrykkopycinski/eslint-plugin-no-memo-displayname)

### License

MIT
