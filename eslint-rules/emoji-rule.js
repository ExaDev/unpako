import emojiRegex from 'emoji-regex';

const noEmojisRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow emojis in code - use Tabler icons from @tabler/icons-react instead',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noEmojis: 'Emojis are not allowed. Use Tabler icons from @tabler/icons-react instead.',
    },
  },

  create(context) {
    const regex = emojiRegex();

    return {
      Literal(node) {
        if (typeof node.value === 'string' && regex.test(node.value)) {
          context.report({
            node,
            messageId: 'noEmojis',
          });
        }
      },

      TemplateElement(node) {
        if (node.value.raw && regex.test(node.value.raw)) {
          context.report({
            node,
            messageId: 'noEmojis',
          });
        }
      },

      JSXText(node) {
        if (node.value && regex.test(node.value)) {
          context.report({
            node,
            messageId: 'noEmojis',
          });
        }
      },
    };
  },
};

export default noEmojisRule;