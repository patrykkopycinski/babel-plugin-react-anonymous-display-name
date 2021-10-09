import * as babel from '@babel/core';

const SUPPORTED_HOCS = ['forwardRef', 'memo'];

const isAnonymousComponent = (
  t: typeof babel.types,
  callee: babel.types.Expression | babel.types.V8IntrinsicIdentifier,
  hocs: string[]
) => {
  if (t.isIdentifier(callee) && hocs.includes(callee.name)) {
    return true;
  }

  if (t.isMemberExpression(callee)) {
    const { property } = callee;

    if (t.isIdentifier(property) && hocs.includes(property.name)) {
      return true;
    }
  }

  return false;
};

const isNamedAlready = (t: typeof babel.types, node: object) => {
  if (t.isArrowFunctionExpression(node)) {
    return false;
  }
  if (t.isFunctionExpression(node)) {
    return Boolean(node.id);
  }
  return true;
};

export default ({
  types: t
}: typeof babel): babel.PluginObj<{ hocs?: string[] }> => ({
  visitor: {
    VariableDeclaration(path, state) {
      const hocs = state.hocs ?? SUPPORTED_HOCS;
      const declarators = path.get('declarations');

      declarators.forEach((declarator) => {
        if (
          !t.isIdentifier(declarator.node.id) ||
          !t.isCallExpression(declarator.node.init)
        ) {
          return;
        }
        const firstArgument = declarator.node.init.arguments[0] as any;
        if (
          isNamedAlready(t, firstArgument) ||
          !isAnonymousComponent(t, declarator.node.init.callee, hocs)
        ) {
          return;
        }
        declarator.replaceWith(
          t.variableDeclarator(
            t.identifier(declarator.node.id.name),
            t.callExpression(declarator.node.init.callee, [
              t.functionExpression(
                t.identifier(declarator.node.id.name),
                firstArgument.params,
                // is memo((props) => { return *; }) case
                t.isBlockStatement(firstArgument.body)
                  ? firstArgument.body
                  : t.blockStatement([t.returnStatement(firstArgument.body)])
              ),
              ...declarator.node.init.arguments.slice(1)
            ])
          )
        );
      });
    }
  }
});
