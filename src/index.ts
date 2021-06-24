import * as babel from '@babel/core';

const SUPPORTED_HOCS = ['forwardRef', 'memo'];

const isAnonymousComponent = (
  t: typeof babel.types,
  callee: babel.types.Expression | babel.types.V8IntrinsicIdentifier
) => {
  if (t.isIdentifier(callee) && SUPPORTED_HOCS.includes(callee.name)) {
    return true;
  }

  if (t.isMemberExpression(callee)) {
    const { property } = callee;

    if (t.isIdentifier(property) && SUPPORTED_HOCS.includes(property.name)) {
      return true;
    }
  }

  return false;
};

export default ({ types: t }: typeof babel): babel.PluginObj => ({
  visitor: {
    VariableDeclaration(path) {
      const declarators = path.get('declarations');

      declarators.forEach((declarator) => {
        if (
          t.isIdentifier(declarator.node.id) &&
          t.isCallExpression(declarator.node.init) &&
          t.isArrowFunctionExpression(declarator.node.init.arguments[0]) &&
          isAnonymousComponent(t, declarator.node.init.callee)
        ) {
          declarator.replaceWith(
            t.variableDeclarator(
              t.identifier(declarator.node.id.name),
              t.callExpression(declarator.node.init.callee, [
                t.functionExpression(
                  t.identifier(declarator.node.id.name),
                  declarator.node.init.arguments[0].params,
                  // is memo((props) => { return *; }) case
                  t.isBlockStatement(declarator.node.init.arguments[0].body)
                    ? declarator.node.init.arguments[0].body
                    : t.blockStatement([
                        t.returnStatement(
                          declarator.node.init.arguments[0].body
                        )
                      ])
                )
              ])
            )
          );
        }
      });
    }
  }
});
