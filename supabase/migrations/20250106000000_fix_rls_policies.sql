-- Fix RLS policies to resolve group creation and worksheet element issues
-- This migration addresses the specific RLS policy problems identified

-- Step 1: Fix Groups RLS policies to ensure proper INSERT access
DROP POLICY IF EXISTS "Users can manage their own groups" ON public.groups;

-- Create separate policies for better control
CREATE POLICY "Users can insert their own groups" ON public.groups
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own groups" ON public.groups
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own groups" ON public.groups
FOR DELETE USING (auth.uid() = owner_id);

-- Step 2: Fix Worksheet Elements RLS policies for better INSERT control
DROP POLICY IF EXISTS "Users can manage their worksheet elements" ON public.worksheet_elements;
DROP POLICY IF EXISTS "Users can view worksheet elements" ON public.worksheet_elements;

-- Create separate policies for worksheet elements
CREATE POLICY "Users can view worksheet elements" ON public.worksheet_elements
FOR SELECT USING (
  worksheet_id IN (
    SELECT id FROM public.worksheets 
    WHERE owner_id = auth.uid() OR 
    is_shared = true OR
    id IN (
      SELECT worksheet_id FROM public.worksheet_shares 
      WHERE shared_with_user_id = auth.uid() OR
      shared_with_group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can insert worksheet elements" ON public.worksheet_elements
FOR INSERT WITH CHECK (
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can update worksheet elements" ON public.worksheet_elements
FOR UPDATE USING (
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can delete worksheet elements" ON public.worksheet_elements
FOR DELETE USING (
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
);

-- Step 3: Fix Group Members RLS policies to ensure proper INSERT access
DROP POLICY IF EXISTS "Users can join/leave groups" ON public.group_members;

CREATE POLICY "Users can join groups" ON public.group_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their group membership" ON public.group_members
FOR UPDATE USING (
  auth.uid() = user_id OR 
  group_id IN (SELECT id FROM public.groups WHERE owner_id = auth.uid())
);