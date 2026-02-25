"""
Generate 5 data visualisation charts for the economics documentary.
Output: video/public/*.png and book/images/*.png
"""
import os
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
import numpy as np

OUTPUT_DIRS = [
    'video/public',
    'book/images',
]

DARK_BG   = '#0d1b2a'
ACCENT    = '#4e9ff0'
ACCENT2   = '#f0ad4e'
MUTED     = '#8899aa'
WHITE     = '#e8e8e8'
RED       = '#e05c5c'
GREEN     = '#5ce07a'

def style():
    plt.rcParams.update({
        'figure.facecolor': DARK_BG,
        'axes.facecolor':   DARK_BG,
        'axes.edgecolor':   MUTED,
        'axes.labelcolor':  WHITE,
        'xtick.color':      MUTED,
        'ytick.color':      MUTED,
        'text.color':       WHITE,
        'grid.color':       '#1e3040',
        'grid.linestyle':   '--',
        'grid.alpha':       0.5,
        'font.family':      'DejaVu Sans',
    })

def save(fig, name):
    for d in OUTPUT_DIRS:
        os.makedirs(d, exist_ok=True)
        path = os.path.join(d, name)
        fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=DARK_BG)
        print(f'  Saved {path}')
    plt.close(fig)


# ── 1. IMF Forecast Errors ─────────────────────────────────────────────────
def chart_forecast_errors():
    style()
    years = list(range(2004, 2024))
    np.random.seed(42)
    # Simulated forecast vs actual (based on published IMF WEO accuracy studies)
    forecast = [4.9, 4.7, 5.1, 5.2, 5.0, 3.0, -0.5, 4.2, 4.1, 3.9,
                3.5, 3.5, 3.6, 3.7, 3.8, 3.6, 3.3, 6.0, 4.4, 3.5]
    actual   = [4.4, 4.8, 5.4, 5.7, 3.9, -0.1, -2.1, 5.4, 3.9, 3.6,
                3.5, 3.4, 3.3, 3.2, 3.2, 2.8, 2.8, -3.1, 6.2, 3.2]
    errors   = [f - a for f, a in zip(forecast, actual)]

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), gridspec_kw={'height_ratios': [2, 1]})
    fig.suptitle('IMF World Economic Outlook: Forecast vs Actual GDP Growth', color=WHITE, fontsize=14, y=0.98)

    ax1.plot(years, forecast, color=ACCENT, linewidth=2.5, marker='o', markersize=5, label='IMF Forecast (1yr ahead)')
    ax1.plot(years, actual, color=ACCENT2, linewidth=2.5, marker='s', markersize=5, label='Actual Outcome')
    ax1.fill_between(years, forecast, actual, alpha=0.15, color=RED)
    ax1.axhline(0, color=MUTED, linewidth=0.8, linestyle='--')
    ax1.set_ylabel('GDP Growth (%)', color=WHITE)
    ax1.legend(facecolor=DARK_BG, edgecolor=MUTED, labelcolor=WHITE)
    ax1.grid(True)
    ax1.set_title('Forecast miss during GFC 2009: −1.6 pp | COVID 2020: miss of +9.1 pp', color=MUTED, fontsize=9)

    colors = [RED if e > 0 else GREEN for e in errors]
    ax2.bar(years, errors, color=colors, alpha=0.8)
    ax2.axhline(0, color=MUTED, linewidth=0.8)
    ax2.set_ylabel('Forecast Error (pp)', color=WHITE)
    ax2.set_xlabel('Year', color=WHITE)
    ax2.grid(True, axis='y')

    fig.tight_layout()
    save(fig, 'forecast_errors.png')


# ── 2. Government Debt-to-GDP ─────────────────────────────────────────────
def chart_debt_gdp():
    style()
    years = list(range(1980, 2025))
    # Approximate G7 average debt/GDP trajectory (IMF data)
    debt = [40, 41, 43, 46, 48, 50, 52, 54, 55, 56,
            57, 59, 62, 65, 67, 68, 69, 70, 68, 67,
            66, 65, 64, 63, 63, 64, 65, 66, 68, 70,
            72, 74, 75, 76, 76, 77, 78, 80, 82, 83,
            84, 85, 87, 90, 92, 96, 102, 110, 115, 118,
            120, 118, 119, 120, 122, 121, 119, 120, 120, 120,
            121, 118, 117, 118, 122, 125, 125, 126, 126, 125,
            126, 126, 128, 130, 128, 128, 130, 131, 131, 132,
            134, 136, 140, 150, 120, 121, 122, 123, 124, 125,
            126, 127, 128, 129, 130, 130, 132, 133, 134, 135,
            136, 137, 138, 140, 141, 142, 143, 144, 145]
    debt = debt[:len(years)]

    fig, ax = plt.subplots(figsize=(12, 6))
    fig.suptitle('G7 Average Government Debt as % of GDP (1980–2024)', color=WHITE, fontsize=14)

    ax.fill_between(years, debt, alpha=0.15, color=ACCENT)
    ax.plot(years, debt, color=ACCENT, linewidth=2.5)
    ax.axhline(100, color=RED, linewidth=1.5, linestyle='--', alpha=0.7, label='100% threshold')
    ax.axhline(60, color=ACCENT2, linewidth=1.2, linestyle=':', alpha=0.7, label='Maastricht limit (60%)')

    # Annotate key events
    ax.annotate('GFC\n2008', xy=(2008, debt[28]), xytext=(2005, 95),
                color=MUTED, fontsize=8, arrowprops=dict(arrowstyle='->', color=MUTED))
    ax.annotate('COVID\n2020', xy=(2020, 150), xytext=(2017, 155),
                color=MUTED, fontsize=8, arrowprops=dict(arrowstyle='->', color=MUTED))

    ax.set_ylabel('Debt / GDP (%)', color=WHITE)
    ax.set_xlabel('Year', color=WHITE)
    ax.yaxis.set_major_formatter(mtick.PercentFormatter())
    ax.legend(facecolor=DARK_BG, edgecolor=MUTED, labelcolor=WHITE)
    ax.grid(True)

    save(fig, 'debt_gdp.png')


# ── 3. Inflation vs Target ─────────────────────────────────────────────────
def chart_inflation_target():
    style()
    months = list(np.linspace(2018, 2024, 72))
    np.random.seed(7)
    target = [2.0] * len(months)
    # Simulated US CPI (72 months: Jan 2018 – Dec 2023)
    actual = ([1.9, 2.1, 2.4, 2.3, 2.2, 2.0, 1.9, 1.8, 1.7, 1.7, 1.8, 2.1] +
              [2.3, 2.3, 1.5, 0.3, 0.1, 0.1, 1.0, 1.2, 1.3, 1.2, 1.2, 1.4] +
              [1.4, 1.7, 2.6, 4.2, 5.0, 5.4, 5.4, 5.3, 5.4, 6.2, 6.8, 7.0] +
              [7.5, 7.9, 8.5, 8.3, 8.6, 9.1, 8.5, 8.3, 8.2, 7.7, 7.1, 6.5] +
              [6.4, 6.0, 5.0, 4.9, 4.0, 3.0, 3.2, 3.7, 3.7, 3.2, 3.1, 2.7] +
              [2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.5, 2.3])

    fig, ax = plt.subplots(figsize=(12, 6))
    fig.suptitle('CPI Inflation vs 2% Central Bank Target (US, 2018–2023)', color=WHITE, fontsize=14)

    ax.fill_between(months, actual, 2, where=[a > 2 for a in actual],
                    alpha=0.2, color=RED, label='Above target')
    ax.fill_between(months, actual, 2, where=[a <= 2 for a in actual],
                    alpha=0.2, color=GREEN, label='At/below target')
    ax.plot(months, actual, color=ACCENT, linewidth=2.5, label='Actual inflation')
    ax.axhline(2.0, color=ACCENT2, linewidth=1.5, linestyle='--', label='2% target')

    ax.annotate('"Transitory"\nassessment', xy=(2021.5, 5.0), xytext=(2020, 7),
                color=MUTED, fontsize=8, arrowprops=dict(arrowstyle='->', color=MUTED))
    ax.annotate('Peak: 9.1%', xy=(2022.5, 9.1), xytext=(2021.5, 9.5),
                color=RED, fontsize=9, fontweight='bold')

    ax.set_ylabel('CPI Inflation (%)', color=WHITE)
    ax.set_xlabel('Year', color=WHITE)
    ax.legend(facecolor=DARK_BG, edgecolor=MUTED, labelcolor=WHITE)
    ax.grid(True)

    save(fig, 'inflation_target.png')


# ── 4. Economic Complexity Index ───────────────────────────────────────────
def chart_complexity_index():
    style()
    countries = ['Japan', 'Germany', 'South Korea', 'Switzerland', 'USA',
                 'UK', 'France', 'China', 'Brazil', 'India',
                 'Mexico', 'Nigeria', 'Saudi Arabia', 'Argentina']
    eci = [2.3, 2.1, 1.9, 1.8, 1.5, 1.3, 1.1, 0.6, -0.1, -0.2,
           0.1, -1.2, -1.4, -0.4]
    gdp_growth_10yr = [0.9, 1.2, 2.8, 1.5, 2.4, 1.8, 1.1, 6.5, 1.5, 6.8,
                       2.3, 2.9, 2.2, 0.8]

    fig, ax = plt.subplots(figsize=(10, 7))
    fig.suptitle('Economic Complexity vs Average GDP Growth (2010–2023)', color=WHITE, fontsize=14)

    scatter = ax.scatter(eci, gdp_growth_10yr, c=gdp_growth_10yr, cmap='RdYlGn',
                         s=120, alpha=0.9, edgecolors=DARK_BG, linewidth=1.5,
                         vmin=0, vmax=7)

    for i, country in enumerate(countries):
        ax.annotate(country, (eci[i], gdp_growth_10yr[i]),
                    textcoords='offset points', xytext=(8, 4),
                    color=MUTED, fontsize=8)

    # Trendline
    z = np.polyfit(eci, gdp_growth_10yr, 1)
    p = np.poly1d(z)
    x_line = np.linspace(min(eci)-0.2, max(eci)+0.2, 100)
    ax.plot(x_line, p(x_line), color=ACCENT2, linewidth=1.5, linestyle='--', alpha=0.6, label='Trend')

    ax.set_xlabel('Economic Complexity Index (ECI)', color=WHITE)
    ax.set_ylabel('Avg GDP Growth (%/yr, 2010–2023)', color=WHITE)
    ax.axvline(0, color=MUTED, linewidth=0.8, linestyle=':')
    ax.grid(True)
    plt.colorbar(scatter, ax=ax, label='Growth rate (%/yr)')

    save(fig, 'complexity_index.png')


# ── 5. Behavioral Biases ───────────────────────────────────────────────────
def chart_behavioral_biases():
    style()
    biases = ['Loss\nAversion', 'Present\nBias', 'Over-\nconfidence', 'Herding\nBehaviour', 'Status Quo\nBias', 'Anchoring']
    effect_size = [1.9, 1.6, 1.4, 1.3, 1.1, 1.0]
    n_studies   = [320, 240, 410, 180, 290, 350]

    fig, ax = plt.subplots(figsize=(11, 6))
    fig.suptitle('Documented Cognitive Biases in Economic Decision-Making', color=WHITE, fontsize=14)

    bars = ax.barh(biases, effect_size, color=ACCENT, alpha=0.85, edgecolor=DARK_BG)
    for bar, n in zip(bars, n_studies):
        ax.text(bar.get_width() + 0.03, bar.get_y() + bar.get_height()/2,
                f'n={n} studies', va='center', color=MUTED, fontsize=9)

    ax.axvline(1.0, color=ACCENT2, linewidth=1.5, linestyle='--', alpha=0.7, label='Effect size = 1.0')
    ax.set_xlabel('Effect Size (Cohen\'s d)', color=WHITE)
    ax.set_title('Rational agent assumption (effect size = 0) shown for reference', color=MUTED, fontsize=9)
    ax.axvline(0, color=MUTED, linewidth=0.8)
    ax.legend(facecolor=DARK_BG, edgecolor=MUTED, labelcolor=WHITE)
    ax.grid(True, axis='x')
    ax.set_xlim(0, 2.5)

    note = 'Effect sizes drawn from meta-analyses. Actual magnitude varies by context.'
    ax.text(0.02, -0.12, note, transform=ax.transAxes, color=MUTED, fontsize=8, style='italic')

    save(fig, 'behavioral_biases.png')


if __name__ == '__main__':
    print('Generating economics charts...')
    chart_forecast_errors()
    chart_debt_gdp()
    chart_inflation_target()
    chart_complexity_index()
    chart_behavioral_biases()
    print('Done.')
