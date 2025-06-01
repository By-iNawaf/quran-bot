// فحص إذا المستخدم هو المالك
const { ownerId } = require('./config.json');

function isOwner(userId) {
  return userId === ownerId;
}

// تنسيق وقت الاستجابة
function formatMilliseconds(ms) {
  return `${ms}ms`;
}

module.exports = {
  isOwner,
  formatMilliseconds
};
