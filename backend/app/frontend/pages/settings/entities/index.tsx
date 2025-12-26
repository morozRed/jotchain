import { Head, router } from "@inertiajs/react"
import {
  CheckIcon,
  FolderIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { apiPersonPath, apiProjectPath } from "@/routes"

interface Project {
  id: string
  name: string
  color: string | null
  entryCount: number
  personCount: number
  createdAt: string
}

interface Person {
  id: string
  name: string
  entryCount: number
  projectCount: number
  createdAt: string
}

interface EntitiesProps {
  projects: Project[]
  persons: Person[]
}

type EntityType = "project" | "person"

interface DeleteConfirmState {
  open: boolean
  type: EntityType
  ids: string[]
  names: string[]
  totalEntries: number
}

interface RenameState {
  id: string | null
  type: EntityType | null
  name: string
}

export default function Entities({ projects, persons }: EntitiesProps) {
  const [activeTab, setActiveTab] = useState<EntityType>("project")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [selectedPersons, setSelectedPersons] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    type: "project",
    ids: [],
    names: [],
    totalEntries: 0,
  })
  const [renameState, setRenameState] = useState<RenameState>({
    id: null,
    type: null,
    name: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)

  // Filtered lists
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(query))
  }, [projects, searchQuery])

  const filteredPersons = useMemo(() => {
    if (!searchQuery) return persons
    const query = searchQuery.toLowerCase()
    return persons.filter((p) => p.name.toLowerCase().includes(query))
  }, [persons, searchQuery])

  // Selection handlers
  const toggleProjectSelection = useCallback((id: string) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const togglePersonSelection = useCallback((id: string) => {
    setSelectedPersons((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAllProjects = useCallback(() => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set())
    } else {
      setSelectedProjects(new Set(filteredProjects.map((p) => p.id)))
    }
  }, [filteredProjects, selectedProjects.size])

  const selectAllPersons = useCallback(() => {
    if (selectedPersons.size === filteredPersons.length) {
      setSelectedPersons(new Set())
    } else {
      setSelectedPersons(new Set(filteredPersons.map((p) => p.id)))
    }
  }, [filteredPersons, selectedPersons.size])

  // Delete handlers
  const openDeleteConfirm = useCallback(
    (type: EntityType, ids: string[]) => {
      const items = type === "project"
        ? projects.filter((p) => ids.includes(p.id))
        : persons.filter((p) => ids.includes(p.id))

      setDeleteConfirm({
        open: true,
        type,
        ids,
        names: items.map((i) => i.name),
        totalEntries: items.reduce((sum, i) => sum + i.entryCount, 0),
      })
    },
    [projects, persons]
  )

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)

    try {
      // Delete each entity
      for (const id of deleteConfirm.ids) {
        const path = deleteConfirm.type === "project"
          ? apiProjectPath(id)
          : apiPersonPath(id)

        await fetch(path, {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": document.querySelector<HTMLMetaElement>(
              'meta[name="csrf-token"]'
            )?.content || "",
          },
        })
      }

      // Clear selections
      if (deleteConfirm.type === "project") {
        setSelectedProjects(new Set())
      } else {
        setSelectedPersons(new Set())
      }

      // Refresh the page data
      router.reload({ only: ["projects", "persons"] })
    } finally {
      setIsDeleting(false)
      setDeleteConfirm((prev) => ({ ...prev, open: false }))
    }
  }, [deleteConfirm])

  // Rename handlers
  const startRename = useCallback((type: EntityType, id: string, name: string) => {
    setRenameState({ id, type, name })
  }, [])

  const cancelRename = useCallback(() => {
    setRenameState({ id: null, type: null, name: "" })
  }, [])

  const handleRename = useCallback(async () => {
    if (!renameState.id || !renameState.type || !renameState.name.trim()) return

    setIsRenaming(true)

    try {
      const path = renameState.type === "project"
        ? apiProjectPath(renameState.id)
        : apiPersonPath(renameState.id)

      const bodyKey = renameState.type === "project" ? "project" : "person"

      await fetch(path, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]'
          )?.content || "",
        },
        body: JSON.stringify({ [bodyKey]: { name: renameState.name.trim() } }),
      })

      router.reload({ only: ["projects", "persons"] })
    } finally {
      setIsRenaming(false)
      cancelRename()
    }
  }, [renameState, cancelRename])

  const currentSelection = activeTab === "project" ? selectedProjects : selectedPersons
  const hasSelection = currentSelection.size > 0

  return (
    <AppLayout>
      <Head title="Projects & People" />

      <SettingsLayout>
        <section>
          <h2 className="text-[15px] font-medium text-foreground">
            Projects & People
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Manage your projects and people created from mentions
          </p>

          <div className="mt-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as EntityType)}
              className="w-full"
            >
              <div className="flex items-center justify-between gap-4">
                <TabsList className="h-9">
                  <TabsTrigger value="project" className="gap-1.5 text-[13px]">
                    <FolderIcon className="size-3.5" />
                    Projects
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      {projects.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="person" className="gap-1.5 text-[13px]">
                    <UserIcon className="size-3.5" />
                    People
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      {persons.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Search + Bulk Actions Bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${activeTab === "project" ? "projects" : "people"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-[13px]"
                  />
                </div>

                {hasSelection && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-150">
                    <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                      {currentSelection.size} selected
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1.5 text-[13px]"
                      onClick={() =>
                        openDeleteConfirm(activeTab, [...currentSelection])
                      }
                    >
                      <Trash2Icon className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Projects Tab */}
              <TabsContent value="project" className="mt-4">
                {filteredProjects.length === 0 ? (
                  <EmptyState
                    type="project"
                    hasSearch={searchQuery.length > 0}
                  />
                ) : (
                  <div className="space-y-1">
                    {/* Select All Header */}
                    <div className="flex items-center gap-2 px-2 py-2 text-[12px] text-muted-foreground">
                      <Checkbox
                        checked={
                          selectedProjects.size === filteredProjects.length &&
                          filteredProjects.length > 0
                        }
                        onCheckedChange={selectAllProjects}
                        aria-label="Select all projects"
                      />
                      <span className="flex-1">Name</span>
                      <span className="w-14 text-right">Entries</span>
                      <span className="w-14" />
                    </div>

                    {/* Project List */}
                    <div className="space-y-1">
                      {filteredProjects.map((project) => (
                        <EntityRow
                          key={project.id}
                          id={project.id}
                          type="project"
                          name={project.name}
                          color={project.color}
                          entryCount={project.entryCount}
                          isSelected={selectedProjects.has(project.id)}
                          isRenaming={renameState.id === project.id}
                          renameValue={renameState.name}
                          onToggleSelect={toggleProjectSelection}
                          onDelete={() => openDeleteConfirm("project", [project.id])}
                          onStartRename={() =>
                            startRename("project", project.id, project.name)
                          }
                          onCancelRename={cancelRename}
                          onRenameChange={(name) =>
                            setRenameState((prev) => ({ ...prev, name }))
                          }
                          onSaveRename={handleRename}
                          isSaving={isRenaming}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* People Tab */}
              <TabsContent value="person" className="mt-4">
                {filteredPersons.length === 0 ? (
                  <EmptyState
                    type="person"
                    hasSearch={searchQuery.length > 0}
                  />
                ) : (
                  <div className="space-y-1">
                    {/* Select All Header */}
                    <div className="flex items-center gap-2 px-2 py-2 text-[12px] text-muted-foreground">
                      <Checkbox
                        checked={
                          selectedPersons.size === filteredPersons.length &&
                          filteredPersons.length > 0
                        }
                        onCheckedChange={selectAllPersons}
                        aria-label="Select all people"
                      />
                      <span className="flex-1">Name</span>
                      <span className="w-14 text-right">Entries</span>
                      <span className="w-14" />
                    </div>

                    {/* Person List */}
                    <div className="space-y-1">
                      {filteredPersons.map((person) => (
                        <EntityRow
                          key={person.id}
                          id={person.id}
                          type="person"
                          name={person.name}
                          entryCount={person.entryCount}
                          isSelected={selectedPersons.has(person.id)}
                          isRenaming={renameState.id === person.id}
                          renameValue={renameState.name}
                          onToggleSelect={togglePersonSelection}
                          onDelete={() => openDeleteConfirm("person", [person.id])}
                          onStartRename={() =>
                            startRename("person", person.id, person.name)
                          }
                          onCancelRename={cancelRename}
                          onRenameChange={(name) =>
                            setRenameState((prev) => ({ ...prev, name }))
                          }
                          onSaveRename={handleRename}
                          isSaving={isRenaming}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </SettingsLayout>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              Delete {deleteConfirm.ids.length === 1 ? "" : `${deleteConfirm.ids.length} `}
              {deleteConfirm.type === "project"
                ? deleteConfirm.ids.length === 1
                  ? "project"
                  : "projects"
                : deleteConfirm.ids.length === 1
                  ? "person"
                  : "people"}
              ?
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {deleteConfirm.ids.length === 1 ? (
                <>
                  Are you sure you want to delete{" "}
                  <strong className="text-foreground">{deleteConfirm.names[0]}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to delete these{" "}
                  {deleteConfirm.type === "project" ? "projects" : "people"}?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteConfirm.totalEntries > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning-bg p-3">
              <p className="text-[13px] text-warning">
                {deleteConfirm.totalEntries === 1
                  ? "1 entry mentions"
                  : `${deleteConfirm.totalEntries} entries mention`}{" "}
                {deleteConfirm.ids.length === 1
                  ? "this " + deleteConfirm.type
                  : "these " + (deleteConfirm.type === "project" ? "projects" : "people")}
                . The mentions will appear as deleted in those entries.
              </p>
            </div>
          )}

          {deleteConfirm.ids.length > 1 && (
            <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-subtle p-3">
              <ul className="space-y-1 text-[13px]">
                {deleteConfirm.names.map((name, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {deleteConfirm.type === "project" ? (
                      <FolderIcon className="size-3.5 text-muted-foreground" />
                    ) : (
                      <UserIcon className="size-3.5 text-muted-foreground" />
                    )}
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

interface EntityRowProps {
  id: string
  type: EntityType
  name: string
  color?: string | null
  entryCount: number
  isSelected: boolean
  isRenaming: boolean
  renameValue: string
  onToggleSelect: (id: string) => void
  onDelete: () => void
  onStartRename: () => void
  onCancelRename: () => void
  onRenameChange: (name: string) => void
  onSaveRename: () => void
  isSaving: boolean
}

function EntityRow({
  id,
  type,
  name,
  color,
  entryCount,
  isSelected,
  isRenaming,
  renameValue,
  onToggleSelect,
  onDelete,
  onStartRename,
  onCancelRename,
  onRenameChange,
  onSaveRename,
  isSaving,
}: EntityRowProps) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-subtle">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(id)}
        aria-label={`Select ${name}`}
      />

      {/* Icon + Name */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {type === "project" ? (
          <div
            className="flex size-6 items-center justify-center rounded-md shrink-0"
            style={{
              backgroundColor: color ? `${color}18` : "var(--primary-soft-bg)",
              color: color || "var(--primary)",
            }}
          >
            <FolderIcon className="size-3.5" />
          </div>
        ) : (
          <div className="flex size-6 items-center justify-center rounded-md bg-primary-soft-bg text-primary shrink-0">
            <UserIcon className="size-3.5" />
          </div>
        )}

        {isRenaming ? (
          <div className="flex flex-1 items-center gap-1.5">
            <Input
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveRename()
                if (e.key === "Escape") onCancelRename()
              }}
              className="h-7 flex-1 text-[13px]"
              autoFocus
              disabled={isSaving}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onSaveRename}
              disabled={isSaving || !renameValue.trim()}
            >
              <CheckIcon className="size-3.5 text-success" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onCancelRename}
              disabled={isSaving}
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        ) : (
          <span className="truncate text-[13px] font-medium text-foreground">
            {name}
          </span>
        )}
      </div>

      {/* Entry Count */}
      <span className="w-14 text-right text-[12px] text-muted-foreground tabular-nums shrink-0">
        {entryCount === 0 ? (
          <span className="text-muted-foreground/50">—</span>
        ) : (
          entryCount
        )}
      </span>

      {/* Actions */}
      <div className="flex w-14 items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
        {!isRenaming && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onStartRename}
              title="Rename"
            >
              <PencilIcon className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2Icon className="size-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  type: EntityType
  hasSearch: boolean
}

function EmptyState({ type, hasSearch }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-subtle">
        {type === "project" ? (
          <FolderIcon className="size-6 text-muted-foreground" />
        ) : (
          <UserIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="mt-4 text-[14px] font-medium text-foreground">
        {hasSearch
          ? `No ${type === "project" ? "projects" : "people"} found`
          : `No ${type === "project" ? "projects" : "people"} yet`}
      </h3>
      <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
        {hasSearch
          ? "Try a different search term"
          : `${type === "project" ? "Projects" : "People"} are created when you mention them with @ in your entries`}
      </p>
    </div>
  )
}
