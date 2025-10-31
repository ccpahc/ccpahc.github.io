# Contributing to CCP-AHC

Thank you for your interest in contributing to the Collaborative Computational Project for Arts, Humanities, and Culture (CCP-AHC). This guide outlines our contribution process and standards to ensure consistency and quality across our repositories.

## Table of Contents

- [About CCP-AHC](#about-ccp-ahc)
- [Code of Conduct](#code-of-conduct)
- [Getting Help](#getting-help)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Testing Standards](#testing-standards)
- [Documentation](#documentation)
- [Community Resources](#community-resources)

## About CCP-AHC

CCP-AHC is a UKRI-funded initiative supporting the sustainable development of research software, pipelines, and workflows used by arts, humanities, and culture researchers. Our mission is to ensure these tools make optimal use of UK-based digital research infrastructure, including high-performance computing and advanced computing facilities.

This project implements the Collaborative Computational Project model that has successfully served scientific software communities for decades, now adapted for computationally-intensive arts, humanities, and culture research and innovation.

For more information about CCP-AHC, visit [www.ccpahc.ac.uk](https://www.ccpahc.ac.uk/).

## Code of Conduct

CCP-AHC is committed to fostering an inclusive, respectful, and professional environment for all contributors. All participants in our repositories and community spaces are expected to:

- Treat all community members with respect and professionalism
- Engage constructively in technical discussions
- Provide and accept constructive feedback gracefully
- Prioritise the project's objectives and the broader research community's needs
- Acknowledge and respect diverse perspectives and experiences

Unacceptable behaviour includes:

- Harassment, discrimination, or intimidation of any kind
- Personal attacks or inflammatory comments
- Publishing others' private information without consent
- Conduct that would be inappropriate in a professional academic or research setting
- Trolling, deliberate disruption, or bad-faith participation

Violations should be reported to [ccpahc@durham.ac.uk](mailto:ccpahc@durham.ac.uk). All reports will be reviewed and addressed appropriately by the project leadership.

## Getting Help

Before requesting assistance:

1. Review the repository's README and available documentation
2. Search existing [Issues](../../issues) for similar questions or problems
3. Check the [CCP-AHC website](https://www.ccpahc.ac.uk/) for project-wide information
4. Consider attending the [CCP-AHC Community Forum](https://www.ccpahc.ac.uk/activities/community-forum/) (second Tuesday of each month, 12:30–13:30 UK time), where we may be able to answer questions.

If you require further assistance:

- Open a [new issue](../../issues/new) with a descriptive title
- Provide comprehensive context, including system information and steps to reproduce any problems
- Include relevant error messages, logs, or output

## Getting Started

### Forking and Cloning

To contribute code or documentation changes to this repository:

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/repository-name.git
   cd repository-name
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/CCP-AHC/repository-name.git
   ```

## Development Setup

Development requirements vary by repository. Generally:

1. **Check Requirements**: Review the repository's [README.md](README.md) for specific version requirements
2. **Install Dependencies**: Follow the repository-specific installation instructions
3. **Configure Pre-commit Hooks** (if applicable [`.pre-commit-config.yaml`](.pre-commit-config.yaml) exists):
   ```bash
   pre-commit install
   pre-commit run --all-files
   ```

Pre-commit hooks ensure code consistency and quality standards are maintained across contributions.

## How to Contribute

Contributions may take various forms, including:

- Bug reports and fixes
- Feature enhancements
- Documentation improvements
- Testing improvements
- Performance optimisations
- Usage examples and tutorials

All contributions should align with CCP-AHC's mission to support research software that effectively utilises UK digital research infrastructure.

## Reporting Issues

### Before Submitting

- Verify you are using the latest version of the software
- Confirm the issue has not already been reported
- Determine whether the issue represents a bug, configuration problem, or documentation gap

### Submitting an Issue Report

Open a [new issue](../../issues/new) with:

- A clear, descriptive title
- Detailed description of the problem or suggestion
- Steps to reproduce (for bugs)
- Expected versus actual behaviour
- System information (operating system, software versions, hardware specifications where relevant)
- Complete error messages and stack traces
- Any relevant configuration details

## Pull Requests

### Before Creating a Pull Request

1. **Discuss Significant Changes**: For substantial modifications, open an issue first to discuss the approach with maintainers
2. **Create a Feature Branch**: Branch from `main` (or `develop`, depending on repository conventions)
3. **Keep Current**: Regularly sync with upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Pull Request Guidelines

- **Scope**: Submit one logical change per pull request
- **Description**: Clearly explain the purpose and approach of your changes
- **Issue References**: Link related issues using "Fixes #123" or "Relates to #456"
- **Testing**: Ensure all tests pass and add tests for new functionality
- **Documentation**: Update relevant documentation to reflect your changes
- **Code Standards**: Follow the repository's style guidelines and pass all pre-commit checks

### Commit Messages

Write clear, informative commit messages following conventional commit format where applicable:

- `feat: add support for new data format`
- `fix: resolve memory leak in processing pipeline`
- `docs: update installation instructions for HPC environments`
- `test: add integration tests for API endpoints`

## Testing Standards

### Running Tests

Test commands vary by repository. Common patterns include:

```bash
# Run all tests
pytest

# Run with coverage reporting
pytest --cov=package_name

# Run specific test categories
pytest tests/unit
pytest tests/integration
```

### Writing Tests

When contributing tests:

- Ensure tests are isolated and repeatable
- Mock external dependencies (hardware, network resources, file systems where appropriate)
- Cover both successful operations and error conditions
- Follow existing test patterns and structure
- Verify tests pass both individually and as part of the full suite

## Documentation

High-quality documentation is essential for research software sustainability. Documentation contributions are highly valued and may include:

- API documentation and examples
- Installation and configuration guides
- Usage tutorials and best practices
- Troubleshooting guides
- Performance tuning recommendations
- Integration with HPC environments

When updating documentation:

- Prioritise clarity and accuracy
- Include practical examples that have been tested
- Consider the needs of both novice and experienced users
- Update documentation whenever functionality changes

## Community Resources

Stay connected with the CCP-AHC community:

- **Website**: [www.ccpahc.ac.uk](https://www.ccpahc.ac.uk/)
- **Email**: [ccpahc@durham.ac.uk](mailto:ccpahc@durham.ac.uk)
- **Community Forum**: Monthly online meetings (second Tuesday, 12:30–13:30 UK time)
- **Mailing Lists**:
  - [CCP-AHC-ANNOUNCE](https://www.jiscmail.ac.uk/cgi-bin/wa-jisc.exe?SUBED1=CCP-AHC-ANNOUNCE&A=1) for project updates
  - [CCP-AHC-DISCUSS](https://www.jiscmail.ac.uk/cgi-bin/wa-jisc.exe?SUBED1=CCP-AHC-DISCUSS&A=1) for community discussions

## Contributor Agreement

By contributing to this project, you affirm that:

- You have authored 100% of the contributed content, or have the necessary rights to submit it
- You understand and agree that your contribution will be provided under the project's licence
- Your contribution complies with all applicable laws and regulations

## Questions and Support

For questions about contributing or the project:

- Open an [issue](../../issues/new) in the relevant repository
- Contact the project team at [ccpahc@durham.ac.uk](mailto:ccpahc@durham.ac.uk)
- Attend the monthly Community Forum meetings

---

Thank you for contributing to CCP-AHC. Your work supports the sustainable development of research software for arts, humanities, and culture researchers across the UK and beyond.