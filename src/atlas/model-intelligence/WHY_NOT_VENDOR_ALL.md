# Why the complete vendor tree is externalized

The complete OmniRoute repository remains reproducible from the pinned upstream commit rather than being committed wholesale into ATLAS. This preserves exact source availability for audit while avoiding duplicated UI/build/binary surfaces, license drift, and a false dependency between the ATLAS cognitive kernel and OmniRoute's product tree.
