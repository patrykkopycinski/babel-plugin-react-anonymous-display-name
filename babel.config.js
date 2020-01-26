module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        useBuiltIns: 'usage',
        corejs: '3',
        targets: 'maintained node versions'
      }
    ],
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true
      }
    ]
  ]
};
