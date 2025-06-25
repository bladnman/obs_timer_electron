# Documentation Reorganization Plan

**Status:** 🚧 In Progress - Phase 1 Pending  
**Created:** 2025-06-25  
**Priority:** Medium  
**Last Updated:** 2025-06-25  

## Overview

Reorganize the documentation folder structure to create a more logical and intuitive organization. The current structure has all documentation files in the root `docs/` directory, making it difficult to navigate and understand the different types of documentation. This plan will create clear categories while preserving all content and keeping the `plans/` folder untouched.

**Current Structure Issues:**
- All files mixed together in root docs folder
- No clear separation between user guides, technical specs, and development docs
- Images scattered without organization
- Hard to locate specific types of documentation

**Goals:**
- Create logical groupings by document type and audience
- Improve discoverability of documentation
- Maintain all existing content without modification
- Keep plans folder completely untouched
- Update any internal references between documents

## Phase 1: Analysis and Structure Design
**Goal:** Analyze current documentation and design the new folder structure

- [ ] 1.1 Catalog all existing documentation files and their purposes
- [ ] 1.2 Identify document relationships and cross-references
- [ ] 1.3 Design optimal folder structure based on content types and audiences
- [ ] 1.4 Create mapping of old paths to new paths
- [ ] 1.5 Validate structure doesn't break any existing workflows

## Phase 2: Create New Directory Structure
**Goal:** Set up the new folder organization without moving files yet

- [ ] 2.1 Create `docs/development/` directory for developer-focused content
- [ ] 2.2 Create `docs/specifications/` directory for technical requirements and specs
- [ ] 2.3 Create `docs/requirements/` directory for product requirements
- [ ] 2.4 Create `docs/assets/` directory for images and media files
- [ ] 2.5 Create `docs/processes/` directory for workflow and process documentation

## Phase 3: Move Files to New Structure
**Goal:** Relocate all files to their appropriate new locations

- [ ] 3.1 Move `DEVELOPMENT.md` to `docs/development/`
- [ ] 3.2 Move `RELEASE.md` to `docs/processes/`
- [ ] 3.3 Move `prd.md` to `docs/requirements/`
- [ ] 3.4 Move `current-record-time-specification.md` to `docs/specifications/`
- [ ] 3.5 Move `timer-color-specification.md` to `docs/specifications/`
- [ ] 3.6 Move `images/` folder to `docs/assets/images/`

## Phase 4: Update Cross-References
**Goal:** Fix all internal links and references to reflect new file locations

- [ ] 4.1 Update links in `DEVELOPMENT.md` that reference other docs
- [ ] 4.2 Update links in `RELEASE.md` that reference other docs  
- [ ] 4.3 Check for any references to moved files in source code
- [ ] 4.4 Update any references in root `README.md` to docs files
- [ ] 4.5 Update any package.json or build scripts that reference docs paths

## Phase 5: Create Navigation and Index
**Goal:** Add helpful navigation and overview documentation

- [ ] 5.1 Create `docs/README.md` as navigation index for all documentation
- [ ] 5.2 Add brief descriptions of what's in each folder
- [ ] 5.3 Create quick reference links to commonly needed docs
- [ ] 5.4 Add any necessary .gitkeep files to maintain empty directories

## Phase 6: Validation and Testing
**Goal:** Ensure the reorganization didn't break anything

- [ ] 6.1 Verify all moved files are accessible and properly formatted
- [ ] 6.2 Test that all internal links work correctly
- [ ] 6.3 Check that build processes still work with any doc references
- [ ] 6.4 Validate that the plans folder is completely untouched
- [ ] 6.5 Ensure no documentation content was lost or corrupted

---

Work this plan phase by phase, checking off each item as it is completed. Always update the status line to reflect current progress.