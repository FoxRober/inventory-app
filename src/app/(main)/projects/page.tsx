import { getProjects } from "@/actions/projects";
import { getComponents } from "@/actions/components";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const [initialProjects, allComponents] = await Promise.all([
    getProjects(),
    getComponents()
  ]);
  
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Proyectos</h1>
        <p>Administra tus proyectos y asocia componentes a cada uno.</p>
      </div>
      <ProjectsClient initialProjects={initialProjects} allComponents={allComponents} />
    </div>
  );
}
