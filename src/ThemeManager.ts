export class ThemeManager {
  private colors: Record<string, Record<string, string>>;
  private theme: Record<string, string>;

  constructor(colors: Record<string, Record<string, string>>, theme: string) {
    this.colors = colors;
    this.theme = this.colors[theme];
  }

  /**
   * Returns the hex code of a color associated with a key from the current theme.
   *
   * @param {string} key The color key in the theme (e.g. C, N, BACKGROUND, ...).
   * @returns {string} A color hex value.
   */
  getColor(key: string): string {
    if (key) {
      key = key.toUpperCase();

      if (key in this.theme) {
        return this.theme[key];
      }
    }

    return this.theme['C'];
  }

  /**
   * Sets the theme to the specified string if it exists. If it does not, this
   * does nothing.
   *
   * @param {string} theme the name of the theme to switch to
   */
  setTheme(theme: string): void {
    if (this.colors.hasOwnProperty(theme)) {
      this.theme = this.colors[theme];
    }

    // TODO: this probably should notify those who are watching this theme
    // manager that the theme has changed so that colors can be changed
    // on the fly
  }
}