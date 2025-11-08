declare module '*.jsx' {
  const component: any;
  export default component;
}

declare module '../api/settingsApi' {
  export function getParentProfile(): Promise<any>;
  export function updateParentProfile(profile: any): Promise<any>;
  export function getAllChildren(): Promise<any>;
  export function getChild(childId: number): Promise<any>;
  export function addChild(child: any): Promise<any>;
  export function updateChild(childId: number, child: any): Promise<any>;
  export function deleteChild(childId: number): Promise<any>;
}