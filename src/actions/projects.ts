"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        components: {
          include: { component: true }
        },
        _count: {
          select: { components: true }
        }
      },
      orderBy: { created_at: "desc" },
    });
    
    // Transform to flatten the component data
    return projects.map(proj => ({
      ...proj,
      components: proj.components.map(pc => ({
        ...pc.component,
        project_quantity: pc.quantity
      }))
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function createProject(data: { name: string; description?: string }) {
  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || "",
      },
    });
    revalidatePath("/projects");
    return { success: true, data: project };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message };
  }
}

export async function linkComponentToProject(projectId: string, componentId: string, quantity: number = 1) {
  try {
    await prisma.projectComponent.upsert({
      where: {
        project_id_component_id: {
          project_id: projectId,
          component_id: componentId
        }
      },
      update: {
        quantity: quantity
      },
      create: {
        project_id: projectId,
        component_id: componentId,
        quantity: quantity
      }
    });
    revalidatePath("/projects");
    revalidatePath(`/inventory`);
    return { success: true };
  } catch (error: any) {
    console.error("Error linking component:", error);
    return { success: false, error: error.message };
  }
}

export async function unlinkComponentFromProject(projectId: string, componentId: string) {
  try {
    await prisma.projectComponent.delete({
      where: {
        project_id_component_id: {
          project_id: projectId,
          component_id: componentId
        }
      }
    });
    revalidatePath("/projects");
    revalidatePath(`/inventory`);
    return { success: true };
  } catch (error: any) {
    console.error("Error unlinking component:", error);
    return { success: false, error: error.message };
  }
}
