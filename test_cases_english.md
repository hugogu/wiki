# Issue #1462 Test Cases

# LaTeX Test

## Special Functions

| Symbol | Meaning | Definition/Example |
|------|------|----------|
| $\zeta(s)$ | Riemann zeta function | $\zeta(2) = \frac{\pi^2}{6}$ |
| $\Gamma(x)$ | Gamma function | $\Gamma(n) = (n-1)!$ |
| $\Gamma(z)$ | Gamma function (complex) | $\Gamma(z) = \int_0^{\infty} t^{z-1}e^{-t}dt$ |
| $B(x, y)$ | Beta function | $B(x,y) = \frac{\Gamma(x)\Gamma(y)}{\Gamma(x+y)}$ |
| $\psi(x)$ | Digamma function | $\psi(x) = \frac{\Gamma'(x)}{\Gamma(x)}$ |
| $\mathrm{Heaviside}(x)$ | Heaviside step | $H(x) = \begin{cases} 1 & x \geq 0 \\ 0 & x < 0 \end{cases}$ |
| $\delta(x)$ | Dirac delta function | $\int_{-\infty}^{\infty} \delta(x)dx = 1$ |
| $\mathrm{sinc}(x)$ | sinc function | $\mathrm{sinc}(x) = \frac{\sin x}{x}$ |
| $\mathrm{rect}(x)$ | Rectangular function | $\mathrm{rect}(x) = \begin{cases} 1 & |x| \leq 1/2 \\ 0 & \text{otherwise} \end{cases}$ |
| $\sigma_x, \sigma_y, \sigma_z$ | Pauli matrices | $\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ |
| $\mathfrak{c}$ | Cardinality of the continuum | $|\mathbb{R}| = \mathfrak{c}$ |
| $\sum_{n \in S}$ | Sum over a set | $\sum_{n \in \mathbb{N}} \frac{1}{n^2}$ |

## Array Environment

$\begin{array}{lrc} 1 & 2 & 3 \\ 4 & 5 & 6 \end{array}$

text $\begin{array}{lrc} 1 & 2 & 3 \\ 4 & 5 & 6 \end{array}$ text

## Simple Fractions

$\frac{1}{3}$

text $\frac{1}{3}$ text

## Fractions with Superscripts

$\frac{1^{2}}{3^{4}}$

$\frac{1}{3^{4}}$

$\frac{1^{2}}{3}$

## Einstein Field Equation

$G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}$

## Block Array

$$
\begin{array}{lrc}
1 & 2 & 3 \\
4 & 5 & 6
\end{array}
$$
