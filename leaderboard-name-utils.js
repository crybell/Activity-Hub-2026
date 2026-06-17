(() => {
  function cleanNamePart(value) {
    const lettersOnly = value.replace(/(^['-]+|['-]+$)/g, "");

    if (!lettersOnly || !/\p{L}/u.test(lettersOnly)) {
      return "";
    }

    return lettersOnly
      .toLocaleLowerCase()
      .replace(/(^|['-])\p{L}/gu, (match) => match.toLocaleUpperCase());
  }

  function parsePlayerName(value) {
    const parts = value
      .trim()
      .replace(/[^\p{L}\s'-]/gu, " ")
      .split(/\s+/)
      .map(cleanNamePart)
      .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    if (!firstName || !lastName) {
      return null;
    }

    return { firstName, lastName };
  }

  function formatLeaderboardName(parts, lettersCount) {
    return `${parts.firstName} ${parts.lastName.slice(0, lettersCount)}.`;
  }

  function getDisplayLeaderboardName(value) {
    const maskedName = value.trim().match(/^(.+?)\s+([A-Za-z]{1,30})\.$/u);

    if (maskedName) {
      const firstName = cleanNamePart(maskedName[1]);
      const lastSegment = cleanNamePart(maskedName[2]);

      if (firstName && lastSegment) {
        return `${firstName} ${lastSegment}.`;
      }
    }

    const parts = parsePlayerName(value);
    return parts ? formatLeaderboardName(parts, 1) : value.trim();
  }

  function normalizePlayerName(value) {
    return getDisplayLeaderboardName(value).toLocaleLowerCase();
  }

  function resolveLeaderboardName(parts, leaderboard) {
    const existingNames = new Set(
      leaderboard.map((entry) => normalizePlayerName(entry.name)),
    );
    const maxVisibleLetters = Math.max(1, parts.lastName.length - 1);

    for (let lettersCount = 1; lettersCount <= maxVisibleLetters; lettersCount += 1) {
      const candidate = formatLeaderboardName(parts, lettersCount);

      if (!existingNames.has(candidate.toLocaleLowerCase())) {
        return candidate;
      }
    }

    return "";
  }

  window.LeaderboardNameUtils = {
    cleanNamePart,
    formatLeaderboardName,
    getDisplayLeaderboardName,
    normalizePlayerName,
    parsePlayerName,
    resolveLeaderboardName,
  };
})();
