import { transform } from '@babel/core';
import plugin from '../src';

function run(source: string) {
  const { code } = transform(source, {
    filename: 'test.ts',
    plugins: [plugin]
  })!;
  return code;
}

describe('supported HOC', () => {
  test('anonymous arrow function', () => {
    const source = `
      const Hello4 = React.memo(() => null);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
      "\\"use strict\\";

      const Hello4 = React.memo(function Hello4() {
        return null;
      });"
    `);
  });

  test('anonymous arrow function memo()', () => {
    const source = `
      const Hello4 = memo(() => null);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
      "\\"use strict\\";

      const Hello4 = memo(function Hello4() {
        return null;
      });"
    `);
  });

  test('anonymous function with return', () => {
    const source = `
      const Hello4 = memo(() => {
        const testVariable = true;
  
        return <div />;
      });
    `;

    expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    const Hello4 = memo(function Hello4() {
      const testVariable = true;
      return <div />;
    });"
    `);
  });

  test('predefined Component', () => {
    const source = `
      const Hello4Component = () => null;
      const Hello4 = memo(Hello4Component);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
      "\\"use strict\\";
      
      const Hello4Component = () => null;
      
      const Hello4 = memo(Hello4Component);"
    `);
  });

  test('handle "forwardRef" usage with export', () => {
    const source = `
      export const Hello3 = forwardRef(() => null);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports.Hello3 = void 0;
    const Hello3 = forwardRef(function Hello3() {
      return null;
    });
    exports.Hello3 = Hello3;"
    `);
  });

  test('handle multiple rewrites', () => {
    const source = `
      const Hello2 = React.memo(() => null);
      const Hello4 = memo(() => null);
      const Hello6 = forwardRef<{}>(() => {
        return null
      });
    `;

    expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    const Hello2 = React.memo(function Hello2() {
      return null;
    });
    const Hello4 = memo(function Hello4() {
      return null;
    });
    const Hello6 = forwardRef(function Hello6() {
      return null;
    });"
    `);
  });
});

describe('React.memo', () => {
  test('predefined areEqual function', () => {
    const source = `
      function areEqual(prevProps, nextProps) {}

      const Hello4Component = () => null;
      const Hello4 = memo(Hello4Component, areEqual);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
      "\\"use strict\\";

      function areEqual(prevProps, nextProps) {}

      const Hello4Component = () => null;

      const Hello4 = memo(Hello4Component, areEqual);"
    `);
  });

  test('inline areEqual function', () => {
    const source = `
      const Hello4Component = () => null;

      const Hello4 = memo(Hello4Component, function areEqual(prevProps, nextProps) {});
    `;

    expect(run(source)).toMatchInlineSnapshot(`
      "\\"use strict\\";

      const Hello4Component = () => null;

      const Hello4 = memo(Hello4Component, function areEqual(prevProps, nextProps) {});"
    `);
  });

  test('inline areEqual arrow function', () => {
    const source = `
      const Hello4Component = () => null;

      const Hello4 = memo(Hello4Component, (prevProps, nextProps) => ({}));
    `;

    expect(run(source)).toMatchInlineSnapshot(`
      "\\"use strict\\";

      const Hello4Component = () => null;

      const Hello4 = memo(Hello4Component, (prevProps, nextProps) => ({}));"
    `);
  });
});

describe('React.forwardRef', () => {
  test('handle "forwardRef" usage', () => {
    const source = `
      const Hello3 = forwardRef(() => null);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    const Hello3 = forwardRef(function Hello3() {
      return null;
    });"
    `);
  });
});

describe('unsupported HOC', () => {
  test('handle "withRouter" usage', () => {
    const source = `
      const Hello4 = withRouter(Hello4Component);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
  "\\"use strict\\";

  const Hello4 = withRouter(Hello4Component);"
    `);
  });

  test('handle "withRouter" usage', () => {
    const source = `
      const Hello4 = withRouter(() => <RouterComponent />);
    `;

    expect(run(source)).toMatchInlineSnapshot(`
  "\\"use strict\\";

  const Hello4 = withRouter(() => <RouterComponent />);"
    `);
  });
});

test('handle "memo" usage', () => {
  const source = `
    const Hello4 = memo(() => {
      const testVariable = true;

      return <div />;
    });
  `;

  expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    const Hello4 = memo(function Hello4() {
      const testVariable = true;
      return <div />;
    });"
  `);
});

test('handle TS "memo" usage', () => {
  const source = `
    interface Props {}

    const Hello4 = memo<Props>(() => {
      const testVariable = true;

      return <div />;
    });
  `;

  expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    const Hello4 = memo(function Hello4() {
      const testVariable = true;
      return <div />;
    });"
  `);
});

test('handle "memo" with params usage', () => {
  const source = `
    const Hello4 = memo(({ show, hide }) => <Loader show={show} hide={hide} />);
  `;

  expect(run(source)).toMatchInlineSnapshot(`
    "\\"use strict\\";

    const Hello4 = memo(function Hello4({
      show,
      hide
    }) {
      return <Loader show={show} hide={hide} />;
    });"
  `);
});
